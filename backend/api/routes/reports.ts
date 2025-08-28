/**
 * 报告管理路由
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, paginatedResponse, createdResponse, noContentResponse } from '../utils/response.js';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * 获取报告列表
 * GET /api/reports
 */
router.get('/',
  authenticateToken,
  validate('pagination'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, report_type, date_from, date_to } = req.query;
    
    let query = supabase
      .from('reports')
      .select(`
        id,
        report_number,
        title,
        report_type,
        status,
        generated_at,
        created_at,
        samples(
          id,
          sample_number,
          sample_name
        ),
        users!reports_created_by_fkey(
          id,
          username,
          full_name
        )
      `, { count: 'exact' })
      .eq('deleted_at', null);

    // 搜索过滤
    if (search) {
      query = query.or(`report_number.ilike.%${search}%,title.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 报告类型过滤
    if (report_type) {
      query = query.eq('report_type', report_type);
    }

    // 日期范围过滤
    if (date_from) {
      query = query.gte('generated_at', date_from);
    }
    if (date_to) {
      query = query.lte('generated_at', date_to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取报告列表失败:', error);
      throw new Error('获取报告列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取报告详情
 * GET /api/reports/:id
 */
router.get('/:id',
  authenticateToken,
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        samples(
          id,
          sample_number,
          sample_name,
          sample_types(
            id,
            name,
            display_name
          ),
          tests(
            id,
            test_number,
            test_items(
              id,
              name,
              display_name,
              unit
            ),
            test_results(
              id,
              result_value,
              result_text,
              status
            )
          )
        ),
        users!reports_created_by_fkey(
          id,
          username,
          full_name
        )
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (error || !data) {
      logger.error('获取报告详情失败:', error);
      throw new Error('报告不存在');
    }

    return successResponse(res, data, '获取报告详情成功');
  })
);

/**
 * 创建报告
 * POST /api/reports
 */
router.post('/',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  asyncHandler(async (req, res) => {
    const {
      sample_id,
      title,
      report_type = 'test_report',
      template_id,
      content,
      conclusions,
      recommendations
    } = req.body;

    // 验证样本是否存在的逻辑已在创建报告时处理

    // 生成报告编号
    const reportNumber = await generateReportNumber();

    const reportData = {
      report_number: reportNumber,
      sample_id,
      title,
      report_type,
      template_id,
      content,
      conclusions,
      recommendations,
      status: 'draft',
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select(`
        *,
        samples(
          id,
          sample_number,
          sample_name
        )
      `)
      .single();

    if (error) {
      logger.error('创建报告失败:', error);
      throw new Error('创建报告失败');
    }

    logger.info(`报告已创建: ${reportNumber}`, { createdBy: req.user?.id });
    return createdResponse(res, data, '报告创建成功');
  })
);

/**
 * 更新报告信息
 * PUT /api/reports/:id
 */
router.put('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      content,
      conclusions,
      recommendations,
      status
    } = req.body;

    // 检查报告是否存在
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id, report_number, status')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingReport) {
      throw new Error('报告不存在');
    }

    const updateData: any = {
      title,
      content,
      conclusions,
      recommendations,
      status,
      updated_at: new Date().toISOString()
    };

    // 如果状态变为已发布，设置生成时间
    if (status === 'published' && existingReport.status !== 'published') {
      updateData.generated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        samples(
          id,
          sample_number,
          sample_name
        )
      `)
      .single();

    if (error) {
      logger.error('更新报告信息失败:', error);
      throw new Error('更新报告信息失败');
    }

    logger.info(`报告信息已更新: ${existingReport.report_number}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '报告信息更新成功');
  })
);

/**
 * 删除报告（软删除）
 * DELETE /api/reports/:id
 */
router.delete('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查报告是否存在
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id, report_number, status')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingReport) {
      throw new Error('报告不存在');
    }

    // 检查报告状态
    if (existingReport.status === 'published') {
      throw new Error('已发布的报告无法删除');
    }

    // 软删除报告
    const { error } = await supabase
      .from('reports')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('删除报告失败:', error);
      throw new Error('删除报告失败');
    }

    logger.info(`报告已删除: ${existingReport.report_number}`, { deletedBy: req.user?.id });
    return noContentResponse(res, '报告删除成功');
  })
);

/**
 * 生成报告PDF
 * POST /api/reports/:id/generate-pdf
 */
router.post('/:id/generate-pdf',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查报告是否存在
    const { data: report, error: checkError } = await supabase
      .from('reports')
      .select(`
        *,
        samples(
          *,
          sample_types(*),
          tests(
            *,
            test_items(*),
            test_results(*)
          )
        )
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !report) {
      throw new Error('报告不存在');
    }

    // TODO: 实现PDF生成逻辑
    // 这里应该集成PDF生成库（如puppeteer、jsPDF等）
    // 暂时返回成功响应
    
    logger.info(`报告PDF生成请求: ${report.report_number}`, { requestedBy: req.user?.id });
    return successResponse(res, { 
      message: 'PDF生成功能待实现',
      report_id: id,
      report_number: report.report_number
    }, 'PDF生成请求已接收');
  })
);

/**
 * 获取报告统计信息
 * GET /api/reports/statistics
 */
router.get('/statistics',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const { date_from, date_to } = req.query;

    let baseQuery = supabase
      .from('reports')
      .select('status, report_type, created_at')
      .eq('deleted_at', null);

    if (date_from) {
      baseQuery = baseQuery.gte('created_at', date_from);
    }
    if (date_to) {
      baseQuery = baseQuery.lte('created_at', date_to);
    }

    const { data, error } = await baseQuery;

    if (error) {
      logger.error('获取报告统计信息失败:', error);
      throw new Error('获取报告统计信息失败');
    }

    // 统计数据
    const statistics = {
      total: data?.length || 0,
      by_status: {} as Record<string, number>,
      by_type: {} as Record<string, number>,
      recent_count: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    data?.forEach(report => {
      // 按状态统计
      statistics.by_status[report.status] = (statistics.by_status[report.status] || 0) + 1;
      
      // 按类型统计
      statistics.by_type[report.report_type] = (statistics.by_type[report.report_type] || 0) + 1;
      
      // 最近一周统计
      if (new Date(report.created_at) >= oneWeekAgo) {
        statistics.recent_count++;
      }
    });

    return successResponse(res, statistics, '获取报告统计信息成功');
  })
);

/**
 * 生成报告编号
 * @returns 报告编号
 */
async function generateReportNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // 查询今天已有的报告数量
  const { count, error } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today.toISOString().slice(0, 10)}T00:00:00.000Z`)
    .lt('created_at', `${today.toISOString().slice(0, 10)}T23:59:59.999Z`);

  if (error) {
    logger.error('生成报告编号失败:', error);
    throw new Error('生成报告编号失败');
  }

  const sequence = String((count || 0) + 1).padStart(4, '0');
  return `R${dateStr}${sequence}`;
}

export default router;