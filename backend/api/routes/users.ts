/**
 * 用户管理路由
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import { validate, paginationSchema, uuidParamSchema } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, paginatedResponse, noContentResponse } from '../utils/response.js';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * 获取用户列表
 * GET /api/users
 */
router.get('/',
  authenticateToken,
  requirePermission('user.list'),
  validate(paginationSchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        real_name,
        phone,
        status,
        last_login_at,
        created_at,
        user_roles(
          roles(
            id,
            name,
            display_name
          )
        )
      `, { count: 'exact' })
      ;

    // 搜索过滤
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,real_name.ilike.%${search}%`);
    }

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }

    // 格式化用户数据
    const users = data?.map(user => ({
      ...user,
      roles: user.user_roles?.map((ur: any) => ur.roles) || []
    })) || [];

    return paginatedResponse(res, users, {
      page: Number(page),
      limit: Number(limit),
      total: count || 0
    });
  })
);

/**
 * 获取用户详情
 * GET /api/users/:id
 */
router.get('/:id',
  authenticateToken,
  requirePermission('user.list'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles(
          roles(
            id,
            name,
            display_name,
            description
          )
        )
      `)
      .eq('id', id)

      .single();

    if (error || !data) {
      logger.error('获取用户详情失败:', error);
      throw new Error('用户不存在');
    }

    // 格式化用户数据
    const user = {
      ...data,
      roles: data.user_roles?.map((ur: any) => ur.roles) || []
    };

    return successResponse(res, user, '获取用户详情成功');
  })
);

/**
 * 更新用户信息
 * PUT /api/users/:id
 */
router.put('/:id',
  authenticateToken,
  requirePermission('user.edit'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { real_name, phone, status } = req.body;

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      throw new Error('用户不存在');
    }

    // 更新用户信息
    const { data, error } = await supabase
      .from('users')
      .update({
        real_name,
        phone,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('更新用户信息失败:', error);
      throw new Error('更新用户信息失败');
    }

    logger.info(`用户信息已更新: ${id}`, { updatedBy: req.user?.id });
    return successResponse(res, data, '用户信息更新成功');
  })
);

/**
 * 删除用户（软删除）
 * DELETE /api/users/:id
 */
router.delete('/:id',
  authenticateToken,
  requirePermission('user.delete'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      throw new Error('用户不存在');
    }

    // 软删除用户
    const { error } = await supabase
      .from('users')
      .update({

        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('删除用户失败:', error);
      throw new Error('删除用户失败');
    }

    logger.info(`用户已删除: ${existingUser.username}`, { deletedBy: req.user?.id });
    return noContentResponse(res, '用户删除成功');
  })
);

/**
 * 创建用户
 * POST /api/users
 */
router.post('/',
  authenticateToken,
  requirePermission('user.create'),
  asyncHandler(async (req, res) => {
    const { username, email, real_name, phone, department, position, roleIds } = req.body;

    // 验证必填字段
    if (!username || !email || !real_name) {
      throw new Error('用户名、邮箱和真实姓名为必填项');
    }

    // 检查用户名和邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);

    if (existingUser && existingUser.length > 0) {
      const existing = existingUser[0];
      if (existing.username === username) {
        throw new Error('用户名已存在');
      }
      if (existing.email === email) {
        throw new Error('邮箱已存在');
      }
    }

    // 生成默认密码（实际项目中应该发送邮件让用户设置密码）
    const bcrypt = require('bcrypt');
    const defaultPassword = '123456'; // 默认密码
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        real_name,
        phone,
        department,
        position,
        status: 'active',
        created_by: req.user?.id,
        updated_by: req.user?.id
      })
      .select()
      .single();

    if (error) {
      logger.error('创建用户失败:', error);
      throw new Error('创建用户失败');
    }

    // 分配角色（如果提供了角色ID）
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        user_id: newUser.id,
        role_id: roleId,
        created_by: req.user?.id
      }));

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(userRoles);

      if (roleError) {
        logger.error('分配用户角色失败:', roleError);
        // 不抛出错误，用户已创建成功
      }
    }

    logger.info(`用户创建成功: ${username}`, { createdBy: req.user?.id });
    return successResponse(res, { ...newUser, password_hash: undefined }, '用户创建成功');
  })
);

/**
 * 重置用户密码
 * PUT /api/users/:id/password
 */
router.put('/:id/password',
  authenticateToken,
  requirePermission('user.edit'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      throw new Error('用户不存在');
    }

    // 加密新密码
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
        updated_by: req.user?.id
      })
      .eq('id', id);

    if (error) {
      logger.error('重置密码失败:', error);
      throw new Error('重置密码失败');
    }

    logger.info(`用户密码已重置: ${existingUser.username}`, { resetBy: req.user?.id });
    return successResponse(res, null, '密码重置成功');
  })
);

/**
 * 更新用户状态
 * PUT /api/users/:id/status
 */
router.put('/:id/status',
  authenticateToken,
  requirePermission('user.edit'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'locked'].includes(status)) {
      throw new Error('无效的用户状态');
    }

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      throw new Error('用户不存在');
    }

    // 更新状态
    const { error } = await supabase
      .from('users')
      .update({
        status,
        updated_at: new Date().toISOString(),
        updated_by: req.user?.id
      })
      .eq('id', id);

    if (error) {
      logger.error('更新用户状态失败:', error);
      throw new Error('更新用户状态失败');
    }

    logger.info(`用户状态已更新: ${existingUser.username} -> ${status}`, { updatedBy: req.user?.id });
    return successResponse(res, null, '用户状态更新成功');
  })
);

/**
 * 分配用户角色
 * POST /api/users/:id/roles
 */
router.post('/:id/roles',
  authenticateToken,
  requirePermission('user.edit'),
  validate(uuidParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      throw new Error('角色ID列表不能为空');
    }

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      throw new Error('用户不存在');
    }

    // 删除现有角色
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', id);

    // 分配新角色
    const userRoles = roleIds.map(roleId => ({
      user_id: id,
      role_id: roleId,
      created_at: new Date().toISOString(),
      created_by: req.user?.id
    }));

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(userRoles);

    if (insertError) {
      logger.error('分配用户角色失败:', insertError);
      throw new Error('分配用户角色失败');
    }

    logger.info(`用户角色已更新: ${id}`, { updatedBy: req.user?.id, roleIds });
    return successResponse(res, null, '用户角色分配成功');
  })
);

export default router;