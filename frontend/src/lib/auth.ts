/**
 * 认证服务
 * 封装用户认证相关的功能
 * @author Erikwang
 * @date 2025-08-20
 */

import { supabase } from './supabase'
import type { User, AuthError } from '@supabase/supabase-js'

/**
 * 登录表单数据接口
 */
export interface LoginCredentials {
  email?: string
  username?: string
  password: string
  loginType?: 'email' | 'username'
}

/**
 * 注册表单数据接口
 */
export interface RegisterCredentials {
  email: string
  password: string
  username: string
  realName: string
}

/**
 * 用户信息接口
 */
export interface UserProfile {
  id: string
  email: string
  username: string
  realName: string
  phone?: string
  department?: string
  position?: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
  user: UserProfile | null
  token: string | null
  error: string | null
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 认证响应
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      let email: string

      // 根据登录类型确定邮箱
      if (credentials.loginType === 'username' && credentials.username) {
        console.log('用户名登录，查找邮箱:', credentials.username)
        const foundEmail = await this.getEmailByUsername(credentials.username)
        if (!foundEmail) {
          return {
            user: null,
            token: null,
            error: '用户名不存在',
          }
        }
        email = foundEmail
        console.log('找到邮箱:', email)
      } else if (credentials.email) {
        email = credentials.email
        console.log('邮箱登录:', email)
      } else {
        return {
          user: null,
          token: null,
          error: '请提供邮箱或用户名',
        }
      }

      console.log('调用Supabase登录，邮箱:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password,
      })

      console.log('Supabase登录响应:', { data: !!data, error })

      if (error) {
        console.error('Supabase登录错误:', error)
        return {
          user: null,
          token: null,
          error: this.getErrorMessage(error),
        }
      }

      if (!data.user) {
        return {
          user: null,
          token: null,
          error: '登录失败，请重试',
        }
      }

      // 获取用户详细信息
      const userProfile = await this.getUserProfile(data.user.id)
      console.log('获取用户信息:', !!userProfile)

      return {
        user: userProfile,
        token: data.session?.access_token || null,
        error: null,
      }
    } catch (err) {
      console.error('登录网络错误:', err)
      return {
        user: null,
        token: null,
        error: '网络错误，请检查网络连接',
      }
    }
  }

  /**
   * 用户注册
   * @param credentials 注册凭据
   * @returns 认证响应
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            real_name: credentials.realName,
          },
        },
      })

      if (error) {
        return {
          user: null,
          token: null,
          error: this.getErrorMessage(error),
        }
      }

      if (!data.user) {
        return {
          user: null,
          token: null,
          error: '注册失败，请重试',
        }
      }

      // 创建用户资料
      await this.createUserProfile(data.user.id, credentials)

      return {
        user: null, // 注册后需要邮箱验证
        token: null,
        error: null,
      }
    } catch (err) {
      return {
        user: null,
        token: null,
        error: '网络错误，请检查网络连接',
      }
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return {
        error: error ? this.getErrorMessage(error) : null,
      }
    } catch (err) {
      return {
        error: '登出失败，请重试',
      }
    }
  }

  /**
   * 重置密码
   * @param email 邮箱地址
   * @returns 操作结果
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return {
        error: error ? this.getErrorMessage(error) : null,
      }
    } catch (err) {
      return {
        error: '发送重置邮件失败，请重试',
      }
    }
  }

  /**
   * 更新密码
   * @param password 新密码
   * @returns 操作结果
   */
  static async updatePassword(
    password: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      return {
        error: error ? this.getErrorMessage(error) : null,
      }
    } catch (err) {
      return {
        error: '密码更新失败，请重试',
      }
    }
  }

  /**
   * 获取当前用户
   * @returns 用户信息
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      console.log('🔍 开始获取当前用户信息...')
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ 获取认证用户失败:', error)
        // 如果是API key错误，直接返回null，避免循环
        if (error.message?.includes('No API key found')) {
          console.error('🔑 API key错误，停止获取用户信息')
          return null
        }
        return null
      }

      if (!user) {
        console.log('👤 未找到认证用户')
        return null
      }

      console.log('✅ 认证用户获取成功:', { id: user.id, email: user.email })
      const profile = await this.getUserProfile(user.id, user)
      console.log('📋 用户详细信息:', profile ? '获取成功' : '获取失败')
      return profile
    } catch (err) {
      console.error('❌ 获取当前用户失败:', err)
      return null
    }
  }

  /**
   * 根据用户名查找邮箱
   * @param username 用户名
   * @returns 邮箱地址
   */
  private static async getEmailByUsername(
    username: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single()

      if (error || !data) {
        return null
      }

      return data.email
    } catch (err) {
      return null
    }
  }

  /**
   * 获取用户详细信息
   * @param userId 用户ID
   * @param authUser 认证用户信息（可选，避免重复调用）
   * @returns 用户详细信息
   */
  private static async getUserProfile(
    userId: string,
    authUser?: any
  ): Promise<UserProfile | null> {
    try {
      // 获取用户基本信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        // 如果数据库中没有用户信息，使用传入的认证用户信息创建默认用户信息
        if (authUser) {
          return {
            id: authUser.id,
            email: authUser.email || '',
            username:
              authUser.user_metadata?.username ||
              authUser.email?.split('@')[0] ||
              '',
            realName: authUser.user_metadata?.real_name || '未设置',
            roles: ['user'],
            permissions: [
              'dashboard:view',
              'submission:view',
              'sample:view',
              'experiment:view',
              'report:view',
            ],
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at || authUser.created_at,
          }
        }
        console.warn('用户信息不存在且无认证用户信息:', userId)
        return null
      }

      // 获取用户角色
      const { data: roleData } = await supabase
        .from('user_roles')
        .select(
          `
          roles (
            name,
            display_name
          )
        `
        )
        .eq('user_id', userId)

      const roles = roleData?.map(item => (item as any).roles.name) || ['user']

      // 根据角色获取权限（简化处理）
      const permissions = this.getPermissionsByRoles(roles)

      return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        realName: userData.real_name,
        phone: userData.phone,
        department: userData.department,
        position: userData.position,
        roles,
        permissions,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      }
    } catch (err) {
      return null
    }
  }

  /**
   * 创建用户资料
   * @param userId 用户ID
   * @param credentials 注册凭据
   */
  private static async createUserProfile(
    userId: string,
    credentials: RegisterCredentials
  ): Promise<void> {
    try {
      await supabase.from('users').insert({
        id: userId,
        email: credentials.email,
        username: credentials.username,
        real_name: credentials.realName,
        status: 'active',
      })

      // 分配默认角色
      const { data: defaultRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single()

      if (defaultRole) {
        await supabase.from('user_roles').insert({
          user_id: userId,
          role_id: defaultRole.id,
        })
      }
    } catch (err) {
      console.error('创建用户资料失败:', err)
    }
  }

  /**
   * 根据角色获取权限
   * @param roles 角色列表
   * @returns 权限列表
   */
  private static getPermissionsByRoles(roles: string[]): string[] {
    const permissionMap: Record<string, string[]> = {
      admin: [
        'dashboard:view',
        'submission:view',
        'submission:create',
        'submission:edit',
        'submission:delete',
        'sample:view',
        'sample:create',
        'sample:edit',
        'sample:delete',
        'experiment:view',
        'experiment:create',
        'experiment:edit',
        'experiment:delete',
        'report:view',
        'report:create',
        'report:edit',
        'report:delete',
        'lab:view',
        'lab:create',
        'lab:edit',
        'lab:delete',
        'environment:view',
        'environment:create',
        'environment:edit',
        'environment:delete',
        'user:view',
        'user:create',
        'user:edit',
        'user:delete',
        'settings:view',
        'settings:edit',
      ],
      manager: [
        'dashboard:view',
        'submission:view',
        'submission:create',
        'submission:edit',
        'sample:view',
        'sample:create',
        'sample:edit',
        'experiment:view',
        'experiment:create',
        'experiment:edit',
        'report:view',
        'report:create',
        'report:edit',
        'lab:view',
        'lab:edit',
        'environment:view',
        'user:view',
        'settings:view',
      ],
      user: [
        'dashboard:view',
        'submission:view',
        'submission:create',
        'sample:view',
        'experiment:view',
        'report:view',
        'lab:view',
        'environment:view',
        'settings:view',
      ],
    }

    const allPermissions = new Set<string>()
    roles.forEach(role => {
      const permissions = permissionMap[role] || permissionMap.user
      permissions.forEach(permission => allPermissions.add(permission))
    })

    return Array.from(allPermissions)
  }

  /**
   * 获取错误信息
   * @param error 认证错误
   * @returns 用户友好的错误信息
   */
  private static getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return '账号或密码错误，请检查'
      case 'Email not confirmed':
        return '邮箱未验证，请检查邮箱'
      case 'User not found':
        return '用户不存在'
      case 'Password should be at least 6 characters':
        return '密码至少需要6个字符'
      case 'Unable to validate email address: invalid format':
        return '邮箱格式不正确'
      case 'User already registered':
        return '用户已存在'
      default:
        return error.message || '操作失败，请重试'
    }
  }
}
