/**
 * 检测管理路由
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
 * 获取检测列表
 * GET /api/tests
 */
router.get('/',
  authenticateToken,
  validate('pagination'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, test_item_id, date_from, date_to } = req.query;
    
    let query = supabase
      .from('tests')
      .select(`
        id,
        test_number,
        status,
        priority,
        scheduled_at,
        started_at,
        completed_at,
        created_at,
        samples(
          id,
          sample_number,
          sample_name
        ),
        test_items(
          id,
          name,
          display_name
        ),
        users!tests_assigned_to_fkey(
          id,
          username,
          full_name
        )
      `, { count: 'exact' })
      .eq('deleted_at', null);

    // 搜索过滤
    if (search) {
      query = query.or(`test_number.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 检测项目过滤
    if (test_item_id) {
      query = query.eq('test_item_id', test_item_id);
    }

    // 日期范围过滤
    if (date_from) {
      query = query.gte('scheduled_at', date_from);
    }
    if (date_to) {
      query = query.lte('scheduled_at', date_to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取检测列表失败:', error);
      throw new Error('获取检测列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取检测详情
 * GET /api/tests/:id
 */
router.get('/:id',
  authenticateToken,
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tests')
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
          )
        ),
        test_items(
          id,
          name,
          display_name,
          description,
          method,
          unit
        ),
        users!tests_assigned_to_fkey(
          id,
          username,
          full_name
        ),
        users!tests_created_by_fkey(
          id,
          username,
          full_name
        ),
        test_results(
          id,
          result_value,
          result_text,
          status,
          created_at
        )
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (error || !data) {
      logger.error('获取检测详情失败:', error);
      throw new Error('检测不存在');
    }

    return successResponse(res, data, '获取检测详情成功');
  })
);

/**
 * 创建检测
 * POST /api/tests
 */
router.post('/',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  asyncHandler(async (req, res) => {
    const {
      sample_id,
      test_item_id,
      priority = 'normal',
      scheduled_at,
      assigned_to,
      notes
    } = req.body;

    // 验证样本是否存在
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select('id, sample_number')
      .eq('id', sample_id)
      .eq('deleted_at', null)
      .single();

    if (sampleError || !sample) {
      throw new Error('样本不存在');
    }

    // 验证检测项目是否存在
    const { data: testItem, error: testItemError } = await supabase
      .from('test_items')
      .select('id, name')
      .eq('id', test_item_id)
      .eq('status', 'active')
      .single();

    if (testItemError || !testItem) {
      throw new Error('检测项目不存在或已停用');
    }

    // 生成检测编号
    const testNumber = await generateTestNumber();

    const testData = {
      test_number: testNumber,
      sample_id,
      test_item_id,
      priority,
      status: 'pending',
      scheduled_at: scheduled_at || new Date().toISOString(),
      assigned_to,
      notes,
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tests')
      .insert(testData)
      .select(`
        *,
        samples(
          id,
          sample_number,
          sample_name
        ),
        test_items(
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      logger.error('创建检测失败:', error);
      throw new Error('创建检测失败');
    }

    logger.info(`检测已创建: ${testNumber}`, { createdBy: req.user?.id });
    return createdResponse(res, data, '检测创建成功');
  })
);

/**
 * 更新检测信息
 * PUT /api/tests/:id
 */
router.put('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      priority,
      status,
      scheduled_at,
      assigned_to,
      notes,
      started_at,
      completed_at
    } = req.body;

    // 检查检测是否存在
    const { data: existingTest, error: checkError } = await supabase
      .from('tests')
      .select('id, test_number, status')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingTest) {
      throw new Error('检测不存在');
    }

    const updateData: any = {
      priority,
      status,
      scheduled_at,
      assigned_to,
      notes,
      updated_at: new Date().toISOString()
    };

    // 根据状态更新时间戳
    if (status === 'in_progress' && !existingTest.status.includes('in_progress')) {
      updateData.started_at = started_at || new Date().toISOString();
    }
    if (status === 'completed') {
      updateData.completed_at = completed_at || new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        samples(
          id,
          sample_number,
          sample_name
        ),
        test_items(
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      logger.error('更新检测信息失败:', error);
      throw new Error('更新检测信息失败');
    }

    logger.info(`检测信息已更新: ${existingTest.test_number}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '检测信息更新成功');
  })
);

/**
 * 删除检测（软删除）
 * DELETE /api/tests/:id
 */
router.delete('/:id',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查检测是否存在
    const { data: existingTest, error: checkError } = await supabase
      .from('tests')
      .select('id, test_number, status')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingTest) {
      throw new Error('检测不存在');
    }

    // 检查检测状态
    if (existingTest.status === 'completed') {
      throw new Error('已完成的检测无法删除');
    }

    // 软删除检测
    const { error } = await supabase
      .from('tests')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('删除检测失败:', error);
      throw new Error('删除检测失败');
    }

    logger.info(`检测已删除: ${existingTest.test_number}`, { deletedBy: req.user?.id });
    return noContentResponse(res, '检测删除成功');
  })
);

/**
 * 提交检测结果
 * POST /api/tests/:id/results
 */
router.post('/:id/results',
  authenticateToken,
  requireRoles(['admin', 'manager', 'technician']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { result_value, result_text, status = 'completed', notes } = req.body;

    // 检查检测是否存在
    const { data: existingTest, error: checkError } = await supabase
      .from('tests')
      .select('id, test_number, status')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existingTest) {
      throw new Error('检测不存在');
    }

    if (existingTest.status === 'completed') {
      throw new Error('检测已完成，无法重复提交结果');
    }

    // 创建检测结果
    const resultData = {
      test_id: id,
      result_value,
      result_text,
      status,
      notes,
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data: result, error: resultError } = await supabase
      .from('test_results')
      .insert(resultData)
      .select()
      .single();

    if (resultError) {
      logger.error('创建检测结果失败:', resultError);
      throw new Error('创建检测结果失败');
    }

    // 更新检测状态
    const { error: updateError } = await supabase
      .from('tests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('更新检测状态失败:', updateError);
      throw new Error('更新检测状态失败');
    }

    logger.info(`检测结果已提交: ${existingTest.test_number}`, { createdBy: req.user?.id });
    return createdResponse(res, result, '检测结果提交成功');
  })
);

/**
 * 生成检测编号
 * @returns 检测编号
 */
async function generateTestNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // 查询今天已有的检测数量
  const { count, error } = await supabase
    .from('tests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today.toISOString().slice(0, 10)}T00:00:00.000Z`)
    .lt('created_at', `${today.toISOString().slice(0, 10)}T23:59:59.999Z`);

  if (error) {
    logger.error('生成检测编号失败:', error);
    throw new Error('生成检测编号失败');
  }

  const sequence = String((count || 0) + 1).padStart(4, '0');
  return `T${dateStr}${sequence}`;
}

export default router;