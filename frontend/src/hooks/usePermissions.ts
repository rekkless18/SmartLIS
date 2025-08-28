/**
 * 权限管理Hook
 * 提供权限检查、角色验证等功能
 * @author Erikwang
 * @date 2025-08-20
 */

import { useAuthStore } from '../stores/auth'
import { useMemo } from 'react'
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
  hasAllRoles as checkAllRoles,
  canAccessPage as checkPageAccess,
  getPermissionsByRoles,
  isAdmin as checkIsAdmin,
  PERMISSIONS,
  ROLES,
} from '../lib/permissions'

/**
 * 权限管理Hook
 * @returns 权限相关的方法和状态
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthStore()

  // 获取用户角色列表
  const userRoles = useMemo(() => {
    if (!isAuthenticated || !user) return []
    return user.roles || []
  }, [isAuthenticated, user])

  // 获取用户权限列表（包括角色权限和直接分配的权限）
  const userPermissions = useMemo(() => {
    if (!isAuthenticated || !user) return []

    // 从角色获取权限
    const rolePermissions = getPermissionsByRoles(userRoles)

    // 直接分配的权限
    const directPermissions = user.permissions || []

    // 合并并去重
    const allPermissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ]

    return allPermissions
  }, [isAuthenticated, user, userRoles])

  /**
   * 检查用户是否有指定权限
   * @param permission 权限名称
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated) return false
    return checkPermission(userPermissions, permission)
  }

  /**
   * 检查用户是否有任一权限
   * @param permissions 权限列表
   * @returns 是否有任一权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!isAuthenticated) return false
    return checkAnyPermission(userPermissions, permissions)
  }

  /**
   * 检查用户是否有所有权限
   * @param permissions 权限列表
   * @returns 是否有所有权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!isAuthenticated) return false
    return checkAllPermissions(userPermissions, permissions)
  }

  /**
   * 检查用户是否有指定角色
   * @param role 角色名称
   * @returns 是否有角色
   */
  const hasRole = (role: string): boolean => {
    if (!isAuthenticated) return false
    return checkRole(userRoles, role)
  }

  /**
   * 检查用户是否有任一角色
   * @param roles 角色列表
   * @returns 是否有任一角色
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated) return false
    return checkAnyRole(userRoles, roles)
  }

  /**
   * 检查用户是否有所有角色
   * @param roles 角色列表
   * @returns 是否有所有角色
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!isAuthenticated) return false
    return checkAllRoles(userRoles, roles)
  }

  /**
   * 检查用户是否可以访问指定页面
   * @param pagePath 页面路径
   * @returns 是否可以访问
   */
  const canAccessPage = (pagePath: string): boolean => {
    if (!isAuthenticated) return false
    return checkPageAccess(userPermissions, pagePath)
  }

  /**
   * 检查用户是否可以访问指定模块
   * @param module 模块名称
   * @returns 是否可以访问
   */
  const canAccessModule = (module: string): boolean => {
    if (!isAuthenticated) return false

    // 根据模块名称检查对应的页面权限
    const modulePath = `/${module}`
    return canAccessPage(modulePath)
  }

  /**
   * 检查用户是否为管理员
   * @returns 是否为管理员
   */
  const isAdmin = (): boolean => {
    if (!isAuthenticated) return false
    return checkIsAdmin(userRoles)
  }

  /**
   * 获取用户可访问的菜单项
   * @returns 可访问的菜单项列表
   */
  const getAccessibleMenus = () => {
    if (!isAuthenticated) return []

    const menus = [
      { key: 'dashboard', path: '/dashboard', label: '首页看板' },
      { key: 'submission', path: '/submission', label: '送检管理' },
      { key: 'sample', path: '/sample', label: '样本管理' },
      { key: 'experiment', path: '/experiment', label: '实验管理' },
      { key: 'report', path: '/report', label: '报告管理' },
      { key: 'lab', path: '/lab', label: '实验室管理' },
      { key: 'environment', path: '/environment', label: '环境管理' },
      { key: 'user', path: '/user', label: '用户管理' },
      { key: 'settings', path: '/settings', label: '系统设置' },
    ]

    return menus.filter(menu => canAccessPage(menu.path))
  }

  return {
    // 状态
    userPermissions,
    userRoles,
    isAuthenticated,

    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // 角色检查方法
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // 页面和模块访问检查
    canAccessPage,
    canAccessModule,

    // 特殊角色检查
    isAdmin,

    // 菜单相关
    getAccessibleMenus,

    // 权限和角色常量
    PERMISSIONS,
    ROLES,
  }
}

export default usePermissions
