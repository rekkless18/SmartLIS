/**
 * 系统管理路由
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, paginatedResponse, createdResponse } from '../utils/response.js';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const router = Router();

// ==================== 样本类型管理 ====================

/**
 * 获取样本类型列表
 * GET /api/system/sample-types
 */
router.get('/sample-types',
  authenticateToken,
  validate('pagination'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = supabase
      .from('sample_types')
      .select('*', { count: 'exact' })
      .eq('deleted_at', null);

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 排序
    query = query.order('sort_order', { ascending: true });

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取样本类型列表失败:', error);
      throw new Error('获取样本类型列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 创建样本类型
 * POST /api/system/sample-types
 */
router.post('/sample-types',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('sampleType'),
  asyncHandler(async (req, res) => {
    const { name, display_name, description, sort_order = 0 } = req.body;

    // 检查名称是否已存在
    const { data: existing } = await supabase
      .from('sample_types')
      .select('id')
      .eq('name', name)
      .eq('deleted_at', null)
      .single();

    if (existing) {
      throw new Error('样本类型名称已存在');
    }

    const sampleTypeData = {
      name,
      display_name,
      description,
      sort_order,
      status: 'active',
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sample_types')
      .insert(sampleTypeData)
      .select()
      .single();

    if (error) {
      logger.error('创建样本类型失败:', error);
      throw new Error('创建样本类型失败');
    }

    logger.info(`样本类型已创建: ${name}`, { createdBy: req.user?.id });
    return createdResponse(res, data, '样本类型创建成功');
  })
);

/**
 * 更新样本类型
 * PUT /api/system/sample-types/:id
 */
router.put('/sample-types/:id',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, display_name, description, sort_order, status } = req.body;

    // 检查样本类型是否存在
    const { data: existing, error: checkError } = await supabase
      .from('sample_types')
      .select('id, name')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existing) {
      throw new Error('样本类型不存在');
    }

    // 如果修改了名称，检查新名称是否已存在
    if (name && name !== existing.name) {
      const { data: nameExists } = await supabase
        .from('sample_types')
        .select('id')
        .eq('name', name)
        .eq('deleted_at', null)
        .neq('id', id)
        .single();

      if (nameExists) {
        throw new Error('样本类型名称已存在');
      }
    }

    const updateData = {
      name,
      display_name,
      description,
      sort_order,
      status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sample_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('更新样本类型失败:', error);
      throw new Error('更新样本类型失败');
    }

    logger.info(`样本类型已更新: ${existing.name}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '样本类型更新成功');
  })
);

// ==================== 检测项目管理 ====================

/**
 * 获取检测项目列表
 * GET /api/system/test-items
 */
router.get('/test-items',
  authenticateToken,
  validate('pagination'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, category } = req.query;
    
    let query = supabase
      .from('test_items')
      .select('*', { count: 'exact' })
      .eq('deleted_at', null);

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 分类过滤
    if (category) {
      query = query.eq('category', category);
    }

    // 排序
    query = query.order('sort_order', { ascending: true });

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取检测项目列表失败:', error);
      throw new Error('获取检测项目列表失败');
    }

    return paginatedResponse(res, data || [], {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 创建检测项目
 * POST /api/system/test-items
 */
router.post('/test-items',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const {
      name,
      display_name,
      description,
      category,
      method,
      unit,
      normal_range,
      price,
      duration_hours,
      sort_order = 0
    } = req.body;

    // 检查名称是否已存在
    const { data: existing } = await supabase
      .from('test_items')
      .select('id')
      .eq('name', name)
      .eq('deleted_at', null)
      .single();

    if (existing) {
      throw new Error('检测项目名称已存在');
    }

    const testItemData = {
      name,
      display_name,
      description,
      category,
      method,
      unit,
      normal_range,
      price,
      duration_hours,
      sort_order,
      status: 'active',
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('test_items')
      .insert(testItemData)
      .select()
      .single();

    if (error) {
      logger.error('创建检测项目失败:', error);
      throw new Error('创建检测项目失败');
    }

    logger.info(`检测项目已创建: ${name}`, { createdBy: req.user?.id });
    return createdResponse(res, data, '检测项目创建成功');
  })
);

/**
 * 更新检测项目
 * PUT /api/system/test-items/:id
 */
router.put('/test-items/:id',
  authenticateToken,
  requireRoles(['admin', 'manager']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      name,
      display_name,
      description,
      category,
      method,
      unit,
      normal_range,
      price,
      duration_hours,
      sort_order,
      status
    } = req.body;

    // 检查检测项目是否存在
    const { data: existing, error: checkError } = await supabase
      .from('test_items')
      .select('id, name')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (checkError || !existing) {
      throw new Error('检测项目不存在');
    }

    // 如果修改了名称，检查新名称是否已存在
    if (name && name !== existing.name) {
      const { data: nameExists } = await supabase
        .from('test_items')
        .select('id')
        .eq('name', name)
        .eq('deleted_at', null)
        .neq('id', id)
        .single();

      if (nameExists) {
        throw new Error('检测项目名称已存在');
      }
    }

    const updateData = {
      name,
      display_name,
      description,
      category,
      method,
      unit,
      normal_range,
      price,
      duration_hours,
      sort_order,
      status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('test_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('更新检测项目失败:', error);
      throw new Error('更新检测项目失败');
    }

    logger.info(`检测项目已更新: ${existing.name}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '检测项目更新成功');
  })
);

// ==================== 角色权限管理 ====================

/**
 * 获取角色列表
 * GET /api/system/roles
 */
router.get('/roles',
  authenticateToken,
  requireRoles(['admin']),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permissions(
            id,
            name,
            display_name,
            resource,
            action
          )
        )
      `)
      .eq('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('获取角色列表失败:', error);
      throw new Error('获取角色列表失败');
    }

    // 格式化角色数据
    const roles = data?.map(role => ({
      ...role,
      permissions: role.role_permissions?.map((rp: any) => rp.permissions) || []
    })) || [];

    return successResponse(res, roles, '获取角色列表成功');
  })
);

/**
 * 获取权限列表
 * GET /api/system/permissions
 */
router.get('/permissions',
  authenticateToken,
  requireRoles(['admin']),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('deleted_at', null)
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      logger.error('获取权限列表失败:', error);
      throw new Error('获取权限列表失败');
    }

    // 按资源分组
    const groupedPermissions = data?.reduce((acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, any[]>) || {};

    return successResponse(res, groupedPermissions, '获取权限列表成功');
  })
);

/**
 * 分配角色权限
 * POST /api/system/roles/:id/permissions
 */
router.post('/roles/:id/permissions',
  authenticateToken,
  requireRoles(['admin']),
  validate('uuid'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      throw new Error('权限ID列表格式错误');
    }

    // 检查角色是否存在
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (roleError || !role) {
      throw new Error('角色不存在');
    }

    // 删除现有权限
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    // 分配新权限
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: id,
        permission_id: permissionId,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (insertError) {
        logger.error('分配角色权限失败:', insertError);
        throw new Error('分配角色权限失败');
      }
    }

    logger.info(`角色权限已更新: ${role.name}`, { updatedBy: req.user?.id, permissionIds });
    return successResponse(res, null, '角色权限分配成功');
  })
);

// ==================== 系统设置 ====================

/**
 * 获取系统设置
 * GET /api/system/settings
 */
router.get('/settings',
  authenticateToken,
  requireRoles(['admin']),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('deleted_at', null)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('获取系统设置失败:', error);
      throw new Error('获取系统设置失败');
    }

    // 按分类分组
    const groupedSettings = data?.reduce((acc, setting) => {
      const category = setting.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    }, {} as Record<string, any[]>) || {};

    return successResponse(res, groupedSettings, '获取系统设置成功');
  })
);

/**
 * 更新系统设置
 * PUT /api/system/settings/:key
 */
router.put('/settings/:key',
  authenticateToken,
  requireRoles(['admin']),
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    // 检查设置项是否存在
    const { data: setting, error: checkError } = await supabase
      .from('system_settings')
      .select('id, setting_key')
      .eq('setting_key', key)
      .eq('deleted_at', null)
      .single();

    if (checkError || !setting) {
      throw new Error('系统设置项不存在');
    }

    const { data, error } = await supabase
      .from('system_settings')
      .update({
        setting_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) {
      logger.error('更新系统设置失败:', error);
      throw new Error('更新系统设置失败');
    }

    logger.info(`系统设置已更新: ${key}`, { updatedBy: req.user?.id, value });
    return successResponse(res, data, '系统设置更新成功');
  })
);

export default router;