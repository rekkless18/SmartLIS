/**
 * 用户认证路由
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';
import { 
  generateToken, 
  hashPassword, 
  verifyPassword, 
  updateLastLogin,
  getUserPermissions
} from '../utils/auth.js';
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  conflictResponse,
  formatQueryResult
} from '../utils/response.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', 
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, realName, phone, department, position } = req.body;
    
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();
    
    if (existingUser) {
      conflictResponse(res, '用户名或邮箱已存在');
      return;
    }
    
    // 加密密码
    const passwordHash = await hashPassword(password);
    
    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        real_name: realName,
        phone,
        department,
        position,
        status: 'active'
      })
      .select('id, username, email, real_name, phone, department, position, status, created_at')
      .single();
    
    if (error) {
      logger.error(`用户注册失败: ${error.message}`);
      errorResponse(res, '注册失败，请稍后重试', 500);
      return;
    }
    
    // 分配默认角色（实验员）
    const { data: defaultRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'operator')
      .single();
    
    if (defaultRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_id: defaultRole.id
        });
    }
    
    logger.info(`用户注册成功: ${username}`);
    createdResponse(res, formatQueryResult(newUser), '注册成功');
  })
);

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, loginType = 'username' } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // 根据登录类型构建查询条件
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        password_hash,
        real_name,
        status,
        user_roles(
          roles(
            name,
            display_name
          )
        )
      `);
    
    // 根据登录类型设置查询条件
    if (loginType === 'email') {
      query = query.eq('email', email);
    } else {
      query = query.eq('username', username);
    }
    
    const { data: user, error } = await query.single();
    
    if (error || !user) {
      const identifier = loginType === 'email' ? email : username;
      logger.warn(`登录失败：用户不存在 - ${identifier} (${loginType})`);
      unauthorizedResponse(res, loginType === 'email' ? '邮箱或密码错误' : '用户名或密码错误');
      return;
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      logger.warn(`登录失败：用户已禁用 - ${username}`);
      unauthorizedResponse(res, '账号已被禁用，请联系管理员');
      return;
    }
    
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      const identifier = loginType === 'email' ? email : username;
      logger.warn(`登录失败：密码错误 - ${identifier} (${loginType})`);
      unauthorizedResponse(res, loginType === 'email' ? '邮箱或密码错误' : '用户名或密码错误');
      return;
    }
    
    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    
    // 获取用户权限
    const permissions = await getUserPermissions(user.id);
    
    // 提取用户角色（转换为字符串数组以匹配前端接口）
    const roles = user.user_roles?.map((ur: any) => ur.roles.name) || [];
    
    // 更新最后登录信息
    await updateLastLogin(user.id, clientIP);
    
    const loginData = {
      token,
      user: formatQueryResult({
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.real_name,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        avatar: user.avatar || '',
        roles,
        permissions,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at
      }),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    
    const identifier = loginType === 'email' ? email : username;
    logger.info(`用户登录成功: ${identifier} (${loginType}) (${clientIP})`);
    successResponse(res, loginData, '登录成功');
  })
);

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 在实际应用中，可以将token加入黑名单
    // 这里只是简单的响应成功
    
    logger.info(`用户登出: ${req.user?.username}`);
    successResponse(res, null, '登出成功');
  })
);

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    
    if (!userId) {
      unauthorizedResponse(res, '用户信息不存在');
      return;
    }
    
    // 获取完整的用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        real_name,
        phone,
        department,
        position,
        status,
        last_login_at,
        created_at,
        user_roles(
          roles(
            name,
            display_name
          )
        )
      `)
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      logger.error(`获取用户信息失败: ${error?.message}`);
      errorResponse(res, '获取用户信息失败', 500);
      return;
    }
    
    // 获取用户权限
    const permissions = await getUserPermissions(userId);
    
    // 提取用户角色（转换为字符串数组以匹配前端接口）
    const roles = user.user_roles?.map((ur: any) => ur.roles.name) || [];
    
    const userData = formatQueryResult({
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.real_name,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      avatar: user.avatar || '',
      roles,
      permissions,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at
    });
    
    successResponse(res, userData, '获取用户信息成功');
  })
);

/**
 * 刷新令牌
 * POST /api/auth/refresh
 */
router.post('/refresh',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user;
    
    if (!user) {
      unauthorizedResponse(res, '用户信息不存在');
      return;
    }
    
    // 生成新的JWT令牌
    const newToken = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    
    const tokenData = {
      token: newToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    
    logger.info(`令牌刷新成功: ${user.username}`);
    successResponse(res, tokenData, '令牌刷新成功');
  })
);

export default router;