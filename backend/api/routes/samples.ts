/**
 * 样本管理路由
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
 * 获取样本列表
 * GET /api/samples
 */
router.get('/',
  authenticateToken,
  validate('pagination'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, sample_type_id, date_from, date_to } = req.query;
    
    let query = supabase
      .from('samples')
      .select(`
        id,
        sample_number,
        sample_name,
        description,
        status,
        priority,
        received_at,
        created_at,
        sample_types(
          id,
          name,
          display_name
        ),
        users!samples_created_by_fkey(
          id,
          username,
          full_name
        )
      `, { count: 'exact' })
      .eq('deleted_at', null);

    // 搜索过滤
    if (search) {
      query = query.or(`sample_number.ilike.%${search}%,sample_name.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 样本类型过滤
    if (sample_type_id) {
      query = query.eq('sample_type_id', sample_type_id);
    }

    // 日期范围过滤
    if (date_from) {
      query = query.gte('received_at', date_from);
    }
    if (date_to) {
      query = query.lte('received_at', date_to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取样本列表失败:', error);
      throw new Error('获取样本列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取样本详情
 * GET /api/samples/:id
 */
router.get('/:id',
  authenticateToken,
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('samples')
      .select(`
        *,
        sample_types(
          id,
          name,
          display_name,
          description
        ),
        users!samples_created_by_fkey(
          id,
          username,
          full_name
        ),
        tests(
          id,
          test_number,
          status,
          test_items(
            id,
            name,
            display_name
          )
        )
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (error || !data) {
      logger.error('获取样本详情失败:', error);
      throw new Error('样本不存在');
    }

    return successResponse(res, data, '获取样本详情成功');
  })
);

/**
 * 创建样本
 * POST /api/samples
 */
router.post('/',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  asyncHandler(async (req, res) => {
    const {
      sample_name,
      sample_type_id,
      description,
      priority = 'normal',
      received_at,
      client_info,
      storage_location,
      storage_conditions
    } = req.body;

    // 生成样本编号
    const sampleNumber = await generateSampleNumber();

    const sampleData = {
      sample_number: sampleNumber,
      sample_name,
      sample_type_id,
      description,
      priority,
      status: 'received',
      received_at: received_at || new Date().toISOString(),
      client_info,
      storage_location,
      storage_conditions,
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('samples')
      .insert(sampleData)
      .select(`
        *,
        sample_types(
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      logger.error('创建样本失败:', error);
      throw new Error('创建样本失败');
    }

    logger.info(`样本已创建: ${sampleNumber}`, { createdBy: req.user?.id });
    return createdResponse(res, data, '样本创建成功');
  })
);

/**
 * 更新样本信息
 * PUT /api/samples/:id
 */
router.put('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      sample_name,
      description,
      priority,
      status,
      client_info,
      storage_location,
      storage_conditions
    } = req.body;

    // 检查样本是否存在
    const { data: existingSample, error: checkError } = await supabase
      .from('samples')
      .select('id, sample_number')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingSample) {
      throw new Error('样本不存在');
    }

    const updateData = {
      sample_name,
      description,
      priority,
      status,
      client_info,
      storage_location,
      storage_conditions,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('samples')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        sample_types(
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      logger.error('更新样本信息失败:', error);
      throw new Error('更新样本信息失败');
    }

    logger.info(`样本信息已更新: ${existingSample.sample_number}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '样本信息更新成功');
  })
);

/**
 * 删除样本（软删除）
 * DELETE /api/samples/:id
 */
router.delete('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查样本是否存在
    const { data: existingSample, error: checkError } = await supabase
      .from('samples')
      .select('id, sample_number')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingSample) {
      throw new Error('样本不存在');
    }

    // 检查是否有关联的检测
    const { data: tests, error: testError } = await supabase
      .from('tests')
      .select('id')
      .eq('sample_id', id)
      .eq('deleted_at', null);

    if (testError) {
      logger.error('检查样本关联检测失败:', testError);
      throw new Error('检查样本关联检测失败');
    }

    if (tests && tests.length > 0) {
      throw new Error('该样本存在关联的检测，无法删除');
    }

    // 软删除样本
    const { error } = await supabase
      .from('samples')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('删除样本失败:', error);
      throw new Error('删除样本失败');
    }

    logger.info(`样本已删除: ${existingSample.sample_number}`, { deletedBy: req.user?.id });
    return noContentResponse(res, '样本删除成功');
  })
);

/**
 * 生成样本编号
 * @returns 样本编号
 */
async function generateSampleNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // 查询今天已有的样本数量
  const { count, error } = await supabase
    .from('samples')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today.toISOString().slice(0, 10)}T00:00:00.000Z`)
    .lt('created_at', `${today.toISOString().slice(0, 10)}T23:59:59.999Z`);

  if (error) {
    logger.error('生成样本编号失败:', error);
    throw new Error('生成样本编号失败');
  }

  const sequence = String((count || 0) + 1).padStart(4, '0');
  return `S${dateStr}${sequence}`;
}

export default router;