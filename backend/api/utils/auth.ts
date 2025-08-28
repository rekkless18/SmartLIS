/**
 * 认证相关工具函数
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * JWT载荷接口
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成JWT令牌
 * @description 为用户生成JWT访问令牌
 * @param payload 令牌载荷
 * @returns JWT令牌字符串
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET未配置');
  }
  
  return jwt.sign(payload as object, jwtSecret, {
    expiresIn: jwtExpiresIn
  } as jwt.SignOptions);
};

/**
 * 验证JWT令牌
 * @description 验证JWT令牌的有效性
 * @param token JWT令牌
 * @returns 解码后的载荷或null
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET未配置');
    }
    
    return jwt.verify(token, jwtSecret) as JWTPayload;
  } catch (error) {
    logger.error(`JWT验证失败: ${error}`);
    return null;
  }
};

/**
 * 加密密码
 * @description 使用bcrypt加密用户密码
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 验证密码
 * @description 验证明文密码与哈希密码是否匹配
 * @param password 明文密码
 * @param hashedPassword 哈希密码
 * @returns 是否匹配
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * 获取用户权限
 * @description 从数据库获取用户的所有权限
 * @param userId 用户ID
 * @returns 权限列表
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    logger.info(`开始获取用户权限: ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_roles(
          roles(
            role_permissions(
              permissions(
                code
              )
            )
          )
        )
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error(`数据库查询用户权限失败: ${error.message}`, { userId, error });
      return [];
    }
    
    if (!data) {
      logger.warn(`用户不存在: ${userId}`);
      return [];
    }
    
    logger.info(`用户权限查询成功，原始数据:`, { userId, data });
    
    // 提取权限代码
    const permissions: string[] = [];
    data.user_roles?.forEach((userRole: any) => {
      userRole.roles?.role_permissions?.forEach((rolePermission: any) => {
        if (rolePermission.permissions?.code) {
          permissions.push(rolePermission.permissions.code);
        }
      });
    });
    
    // 去重
    const uniquePermissions = [...new Set(permissions)];
    logger.info(`用户权限提取完成: ${userId}，权限列表: [${uniquePermissions.join(', ')}]`);
    
    return uniquePermissions;
  } catch (error) {
    logger.error(`获取用户权限异常: ${error}`, { userId, error });
    return [];
  }
};

/**
 * 检查用户权限
 * @description 检查用户是否具有指定权限
 * @param userId 用户ID
 * @param requiredPermission 需要的权限代码
 * @returns 是否具有权限
 */
export const checkUserPermission = async (userId: string, requiredPermission: string): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(requiredPermission);
};

/**
 * 更新用户最后登录信息
 * @description 更新用户的最后登录时间和IP地址
 * @param userId 用户ID
 * @param ipAddress IP地址
 */
export const updateLastLogin = async (userId: string, ipAddress: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      logger.error(`更新用户登录信息失败: ${error.message}`);
    }
  } catch (error) {
    logger.error(`更新用户登录信息异常: ${error}`);
  }
};

/**
 * 生成随机密码
 * @description 生成指定长度的随机密码
 * @param length 密码长度，默认12位
 * @returns 随机密码
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * 验证密码强度
 * @description 验证密码是否符合安全要求
 * @param password 密码
 * @returns 验证结果
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('密码长度至少6位');
  }
  
  if (password.length > 128) {
    errors.push('密码长度不能超过128位');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码必须包含数字');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};