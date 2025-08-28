/**
 * 认证中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';
import { getRequiredPermission, hasApiPermission } from '../config/permissions.js';

/**
 * 扩展Request接口，添加用户信息
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions?: string[];
  };
}

/**
 * JWT认证中间件
 * @description 验证JWT token并获取用户信息
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件函数
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: '缺少访问令牌'
      });
      return;
    }

    // 验证JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET未配置');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // 从数据库获取用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        status,
        user_roles(
          roles(
            name,
            display_name
          )
        )
      `)
      .eq('id', decoded.userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      logger.warn(`认证失败：用户不存在或已禁用 - ${decoded.userId}`);
      res.status(401).json({
        success: false,
        error: '无效的访问令牌'
      });
      return;
    }

    // 提取用户角色
    const roles = user.user_roles?.map((ur: any) => ur.roles.name) || [];

    // 获取用户权限
    let permissions: string[] = [];
    try {
      const { getUserPermissions } = await import('../utils/auth.js');
      permissions = await getUserPermissions(user.id);
      logger.info(`用户 ${user.username} 权限加载成功，权限数量: ${permissions.length}`);
    } catch (error) {
      logger.error(`获取用户权限失败: ${error}`, { userId: user.id, username: user.username });
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles,
      permissions
    };

    next();
  } catch (error) {
    logger.error(`JWT认证错误: ${error}`);
    res.status(403).json({
      success: false,
      error: '无效的访问令牌'
    });
  }
};

/**
 * 权限检查中间件
 * @description 检查用户是否具有指定权限
 * @param requiredRoles 需要的角色列表
 * @returns 中间件函数
 */
export const requireRoles = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未认证的用户'
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(`权限不足：用户 ${req.user.username} 尝试访问需要角色 [${requiredRoles.join(', ')}] 的资源`);
      res.status(403).json({
        success: false,
        error: '权限不足'
      });
      return;
    }

    next();
  };
};

/**
 * 权限检查中间件（基于具体权限）
 * @description 检查用户是否具有指定权限
 * @param requiredPermissions 需要的权限列表
 * @returns 中间件函数
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未认证的用户'
      });
      return;
    }

    try {
      // 动态导入getUserPermissions避免循环依赖
      const { getUserPermissions } = await import('../utils/auth.js');
      const userPermissions = await getUserPermissions(req.user.id);
      
      const hasRequiredPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        logger.warn(`权限不足：用户 ${req.user.username} 尝试访问需要权限 [${requiredPermissions.join(', ')}] 的资源`);
        res.status(403).json({
          success: false,
          error: '权限不足'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(`权限检查失败: ${error}`);
      res.status(500).json({
        success: false,
        error: '权限检查失败'
      });
    }
  };
};

/**
 * 可选认证中间件
 * @description 如果提供了token则验证，否则继续执行
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件函数
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  // 如果有token，则验证
  await authenticateToken(req, res, next);
};

/**
 * 动态权限验证中间件
 * @description 根据API路由自动检查所需权限
 * @returns 中间件函数
 */
export const requireApiPermission = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未认证的用户'
      });
      return;
    }

    const method = req.method;
    const path = req.path;
    const userPermissions = req.user.permissions || [];

    // 检查是否有访问该API的权限
    if (!hasApiPermission(userPermissions, method, path)) {
      const requiredPermission = getRequiredPermission(method, path);
      logger.warn(`权限不足：用户 ${req.user.username} 尝试访问 ${method} ${path}，需要权限: ${requiredPermission}`);
      
      res.status(403).json({
        success: false,
        error: '权限不足',
        details: {
          required_permission: requiredPermission,
          user_permissions: userPermissions
        }
      });
      return;
    }

    next();
  };
};

/**
 * 检查特定权限的中间件
 * @description 检查用户是否具有特定权限
 * @param permission 所需权限代码
 * @returns 中间件函数
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.error('权限检查失败：用户未认证');
      res.status(401).json({
        success: false,
        error: '未认证的用户'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    logger.info(`权限检查：用户 ${req.user.username} 尝试访问权限 ${permission}，用户权限: [${userPermissions.join(', ')}]`);
    
    if (!userPermissions.includes(permission)) {
      logger.warn(`权限不足：用户 ${req.user.username} 尝试访问需要权限 ${permission} 的资源`);
      res.status(403).json({
        success: false,
        error: '权限不足',
        details: {
          required_permission: permission,
          user_permissions: userPermissions
        }
      });
      return;
    }

    logger.info(`权限验证通过：用户 ${req.user.username} 具有权限 ${permission}`);
    next();
  };
};