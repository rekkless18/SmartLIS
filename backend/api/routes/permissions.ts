/**
 * 权限管理路由
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import { validate, paginationSchema, uuidParamSchema } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * 获取权限列表
 * GET /api/permissions
 */
router.get('/',
  authenticateToken,
  requirePermission('permission.config'),
  validate(paginationSchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search, module } = req.query;
    
    let query = supabase
      .from('permissions')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('module', { ascending: true })
      .order('name', { ascending: true });

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 模块过滤
    if (module) {
      query = query.eq('module', module);
    }

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取权限列表失败:', error);
      throw new Error('获取权限列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取权限模块列表
 * GET /api/permissions/modules
 */
router.get('/modules',
  authenticateToken,
  requirePermission('permission.config'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('permissions')
      .select('module')
      .eq('is_active', true)
      .order('module');

    if (error) {
      logger.error('获取权限模块失败:', error);
      throw new Error('获取权限模块失败');
    }

    // 去重并格式化
    const modules = [...new Set(data?.map(item => item.module) || [])];
    const moduleList = modules.map(module => ({
      name: module,
      label: module
    }));

    return successResponse(res, moduleList, '获取权限模块成功');
  })
);

/**
 * 按模块分组获取权限
 * GET /api/permissions/grouped
 */
router.get('/grouped',
  authenticateToken,
  requirePermission('permission.config'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('module', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      logger.error('获取分组权限失败:', error);
      throw new Error('获取分组权限失败');
    }

    // 按模块分组
    const groupedPermissions = (data || []).reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = {
          module,
          permissions: []
        };
      }
      acc[module].permissions.push(permission);
      return acc;
    }, {} as Record<string, { module: string; permissions: any[] }>);

    // 转换为数组格式
    const result = Object.values(groupedPermissions);

    return successResponse(res, result, '获取分组权限成功');
  })
);

/**
 * 获取权限详情
 * GET /api/permissions/:id
 */
router.get('/:id',
  authenticateToken,
  requirePermission('permission.config'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error('获取权限详情失败:', error);
      throw new Error('权限不存在');
    }

    return successResponse(res, data, '获取权限详情成功');
  })
);

/**
 * 创建权限
 * POST /api/permissions
 */
router.post('/',
  authenticateToken,
  requirePermission('permission.config'),
  asyncHandler(async (req, res) => {
    const { code, name, module, page_name, route_path, description, sort_order } = req.body;

    // 验证必填字段
    if (!code || !name || !module || !page_name || !route_path) {
      throw new Error('权限编码、名称、模块、页面名称和路由路径为必填项');
    }

    // 检查权限编码是否已存在
    const { data: existingPermission } = await supabase
      .from('permissions')
      .select('code')
      .eq('code', code)
      .single();

    if (existingPermission) {
      throw new Error('权限编码已存在');
    }

    // 创建权限
    const { data: newPermission, error } = await supabase
      .from('permissions')
      .insert({
        code,
        name,
        module,
        page_name,
        route_path,
        description,
        sort_order: sort_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      logger.error('创建权限失败:', error);
      throw new Error('创建权限失败');
    }

    logger.info(`权限创建成功: ${code}`, { createdBy: req.user?.id });
    return successResponse(res, newPermission, '权限创建成功');
  })
);

/**
 * 更新权限信息
 * PUT /api/permissions/:id
 */
router.put('/:id',
  authenticateToken,
  requirePermission('permission.config'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, module, page_name, route_path, description, sort_order, is_active } = req.body;

    // 检查权限是否存在
    const { data: existingPermission, error: checkError } = await supabase
      .from('permissions')
      .select('id, code')
      .eq('id', id)
      .single();

    if (checkError || !existingPermission) {
      throw new Error('权限不存在');
    }

    // 更新权限信息
    const { data, error } = await supabase
      .from('permissions')
      .update({
        name,
        module,
        page_name,
        route_path,
        description,
        sort_order,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('更新权限信息失败:', error);
      throw new Error('更新权限信息失败');
    }

    logger.info(`权限信息已更新: ${existingPermission.code}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '权限信息更新成功');
  })
);

/**
 * 删除权限
 * DELETE /api/permissions/:id
 */
router.delete('/:id',
  authenticateToken,
  requirePermission('permission.config'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查权限是否存在
    const { data: existingPermission, error: checkError } = await supabase
      .from('permissions')
      .select('id, code')
      .eq('id', id)
      .single();

    if (checkError || !existingPermission) {
      throw new Error('权限不存在');
    }

    // 检查是否有角色使用该权限
    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('permission_id', id)
      .limit(1);

    if (rolePermissions && rolePermissions.length > 0) {
      throw new Error('该权限正在被角色使用，无法删除');
    }

    // 删除权限
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('删除权限失败:', error);
      throw new Error('删除权限失败');
    }

    logger.info(`权限已删除: ${existingPermission.code}`, { deletedBy: req.user?.id });
    return successResponse(res, null, '权限删除成功');
  })
);

export default router;