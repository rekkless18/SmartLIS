/**
 * 角色管理路由
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import { validate, paginationSchema, uuidParamSchema } from '../middleware/validation.js';
import { asyncErrorHandler as asyncHandler } from '../middleware/enhancedErrorHandler.js';
import { successResponse, paginatedResponse, noContentResponse } from '../utils/response.js';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * 获取角色列表
 * GET /api/roles
 */
router.get('/',
  authenticateToken,
  requirePermission('role.list'),
  validate(paginationSchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = supabase
      .from('roles')
      .select(`
        id,
        name,
        display_name,
        description,
        is_system,
        status,
        created_at,
        updated_at,
        role_permissions(
          permissions(
            id,
            code,
            name,
            module
          )
        )
      `, { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取角色列表失败:', error);
      throw new Error('获取角色列表失败');
    }

    // 格式化角色数据并计算用户数量
    const roles = await Promise.all(data?.map(async (role) => {
      // 查询使用该角色的用户数量
      const { count: userCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', role.id);
      
      return {
        ...role,
        permissions: role.role_permissions?.map((rp: any) => rp.permissions) || [],
        userCount: userCount || 0
      };
    }) || []);

    return paginatedResponse(res, roles, {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取角色详情
 * GET /api/roles/:id
 */
router.get('/:id',
  authenticateToken,
  requirePermission('role.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('roles')
      .select(`
        id,
        name,
        display_name,
        description,
        is_system,
        status,
        created_at,
        updated_at,
        created_by,
        updated_by,
        role_permissions(
          permissions(
            id,
            code,
            name,
            module,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error('获取角色详情失败:', error);
      throw new Error('角色不存在');
    }

    // 格式化角色数据
    const role = {
      ...data,
      permissions: data.role_permissions?.map((rp: any) => rp.permissions) || []
    };

    return successResponse(res, role, '获取角色详情成功');
  })
);

/**
 * 创建角色
 * POST /api/roles
 */
router.post('/',
  authenticateToken,
  requirePermission('role.list'),
  asyncHandler(async (req, res) => {
    const { name, display_name, description, permissionIds } = req.body;

    // 验证必填字段
    if (!name || !display_name) {
      throw new Error('角色名称和显示名称为必填项');
    }

    // 检查角色名称是否已存在
    const { data: existingRole } = await supabase
      .from('roles')
      .select('name')
      .eq('name', name)
      .single();

    if (existingRole) {
      throw new Error('角色名称已存在');
    }

    // 创建角色
    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        name,
        display_name,
        description,
        is_system: false,
        status: true, // 默认启用状态
        created_by: req.user?.id,
        updated_by: req.user?.id
      })
      .select()
      .single();

    if (error) {
      logger.error('创建角色失败:', error);
      throw new Error('创建角色失败');
    }

    // 分配权限（如果提供了权限ID）
    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: newRole.id,
        permission_id: permissionId,
        created_by: req.user?.id
      }));

      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (permissionError) {
        logger.error('分配角色权限失败:', permissionError);
        // 不抛出错误，角色已创建成功
      }
    }

    logger.info(`角色创建成功: ${name}`, { createdBy: req.user?.id });
    return successResponse(res, newRole, '角色创建成功');
  })
);

/**
 * 更新角色信息
 * PUT /api/roles/:id
 */
router.put('/:id',
  authenticateToken,
  requirePermission('role.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { display_name, description, status } = req.body;

    // 检查角色是否存在
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id, name, is_system, status')
      .eq('id', id)
      .single();

    if (checkError || !existingRole) {
      throw new Error('角色不存在');
    }

    // 检查是否为系统角色
    if (existingRole.is_system) {
      throw new Error('系统角色不允许修改');
    }

    // 构建更新数据对象
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id
    };

    // 只更新提供的字段
    if (display_name !== undefined) {
      updateData.display_name = display_name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (status !== undefined) {
      // 验证状态值 - status应该是boolean类型
      if (typeof status !== 'boolean') {
        throw new Error('状态值必须是布尔类型');
      }
      updateData.status = status;
    }

    // 更新角色信息
    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('更新角色信息失败:', error);
      throw new Error('更新角色信息失败');
    }

    logger.info(`角色信息已更新: ${existingRole.name}`, { updatedBy: req.user?.id, updateData });
    return successResponse(res, data, '角色信息更新成功');
  })
);

/**
 * 删除角色
 * DELETE /api/roles/:id
 */
router.delete('/:id',
  authenticateToken,
  requirePermission('role.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查角色是否存在
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id, name, is_system, status')
      .eq('id', id)
      .single();

    if (checkError || !existingRole) {
      throw new Error('角色不存在');
    }

    // 检查是否为系统角色
    if (existingRole.is_system) {
      throw new Error('系统角色不允许删除');
    }

    // 检查是否有用户使用该角色
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (userRoles && userRoles.length > 0) {
      throw new Error('该角色正在被用户使用，无法删除');
    }

    // 删除角色权限关联
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    // 删除角色
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('删除角色失败:', error);
      throw new Error('删除角色失败');
    }

    logger.info(`角色已删除: ${existingRole.name}`, { deletedBy: req.user?.id });
    return noContentResponse(res, '角色删除成功');
  })
);

/**
 * 获取角色权限列表
 * GET /api/roles/:id/permissions
 */
router.get('/:id/permissions',
  authenticateToken,
  requirePermission('role.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查角色是否存在
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingRole) {
      throw new Error('角色不存在');
    }

    // 获取角色权限
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions(
          id,
          code,
          name,
          module,
          page_name,
          route_path,
          description,
          sort_order,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('role_id', id);

    if (error) {
      logger.error('获取角色权限失败:', error);
      throw new Error('获取角色权限失败');
    }

    // 提取权限数据
    const permissions = data?.map((rp: any) => rp.permissions).filter(Boolean) || [];

    return successResponse(res, permissions, '获取角色权限成功');
  })
);

/**
 * 分配角色权限
 * POST /api/roles/:id/permissions
 */
router.post('/:id/permissions',
  authenticateToken,
  requirePermission('role.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      throw new Error('权限ID列表格式错误');
    }

    // 检查角色是否存在
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id, name, is_system')
      .eq('id', id)
      .single();

    if (checkError || !existingRole) {
      throw new Error('角色不存在');
    }

    // 检查是否为系统角色
    if (existingRole.is_system) {
      throw new Error('系统角色权限不允许修改');
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
        created_by: req.user?.id
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (insertError) {
        logger.error('分配角色权限失败:', insertError);
        throw new Error('分配角色权限失败');
      }
    }

    logger.info(`角色权限已更新: ${existingRole.name}`, { updatedBy: req.user?.id, permissionIds });
    return successResponse(res, null, '角色权限分配成功');
  })
);

export default router;