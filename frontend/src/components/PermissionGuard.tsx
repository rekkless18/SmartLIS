/**
 * 权限守卫组件
 * 用于控制按钮、链接等UI元素的权限显示
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react'
import { usePermissions } from '../hooks/usePermissions'

// 权限守卫组件属性
interface PermissionGuardProps {
  children: React.ReactNode
  // 权限配置
  permission?: string // 单个权限
  permissions?: string[] // 多个权限
  role?: string // 单个角色
  roles?: string[] // 多个角色
  // 权限检查模式
  requireAll?: boolean // 是否需要所有权限/角色（默认false，即任意一个即可）
  // 权限检查类型
  checkType?: 'permission' | 'role' | 'both' // 检查类型：权限、角色或两者都检查
  // 无权限时的行为
  fallback?: React.ReactNode // 无权限时显示的内容
  hideWhenNoPermission?: boolean // 无权限时是否隐藏（默认true）
  disableWhenNoPermission?: boolean // 无权限时是否禁用（默认false）
  // 自定义权限检查函数
  customCheck?: () => boolean
}

/**
 * 权限守卫组件
 * @param props 组件属性
 * @returns 权限控制后的组件
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  checkType = 'permission',
  fallback = null,
  hideWhenNoPermission = true,
  disableWhenNoPermission = false,
  customCheck,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isAuthenticated,
  } = usePermissions()

  // 如果未登录，根据配置决定是否显示
  if (!isAuthenticated) {
    return hideWhenNoPermission ? null : fallback || children
  }

  // 管理员拥有所有权限
  if (isAdmin) {
    return <>{children}</>
  }

  // 自定义权限检查
  if (customCheck) {
    const hasCustomPermission = customCheck()
    if (!hasCustomPermission) {
      if (hideWhenNoPermission) return fallback
      if (disableWhenNoPermission && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement, {
          disabled: true,
        })
      }
      return fallback || <>{children}</>
    }
    return <>{children}</>
  }

  let hasRequiredPermission = false

  // 权限检查逻辑
  if (checkType === 'permission' || checkType === 'both') {
    // 构建权限列表
    const allPermissions = [...permissions]
    if (permission) allPermissions.push(permission)

    if (allPermissions.length > 0) {
      hasRequiredPermission = requireAll
        ? hasAllPermissions(allPermissions)
        : hasAnyPermission(allPermissions)
    } else {
      hasRequiredPermission = true // 没有指定权限要求，默认通过
    }
  }

  // 角色检查逻辑
  if (checkType === 'role' || checkType === 'both') {
    // 构建角色列表
    const allRoles = [...roles]
    if (role) allRoles.push(role)

    if (allRoles.length > 0) {
      const hasRequiredRole = requireAll
        ? hasAllRoles(allRoles)
        : hasAnyRole(allRoles)

      // 如果是both模式，需要同时满足权限和角色要求
      if (checkType === 'both') {
        hasRequiredPermission = hasRequiredPermission && hasRequiredRole
      } else {
        hasRequiredPermission = hasRequiredRole
      }
    }
  }

  // 根据权限检查结果决定渲染行为
  if (!hasRequiredPermission) {
    // 无权限时的处理
    if (hideWhenNoPermission) {
      return fallback
    }

    if (disableWhenNoPermission && React.isValidElement(children)) {
      // 禁用子组件
      return React.cloneElement(children as React.ReactElement, {
        disabled: true,
        className:
          `${(children as React.ReactElement).props.className || ''} opacity-50 cursor-not-allowed`.trim(),
      })
    }

    return fallback || <>{children}</>
  }

  return <>{children}</>
}

// 便捷的权限检查组件
export const PermissionButton: React.FC<
  PermissionGuardProps & {
    onClick?: () => void
    className?: string
    type?: 'button' | 'submit' | 'reset'
  }
> = ({ children, onClick, className, type = 'button', ...permissionProps }) => {
  return (
    <PermissionGuard {...permissionProps} disableWhenNoPermission>
      <button type={type} onClick={onClick} className={className}>
        {children}
      </button>
    </PermissionGuard>
  )
}

// 便捷的权限链接组件
export const PermissionLink: React.FC<
  PermissionGuardProps & {
    to?: string
    href?: string
    onClick?: () => void
    className?: string
  }
> = ({ children, to, href, onClick, className, ...permissionProps }) => {
  return (
    <PermissionGuard {...permissionProps}>
      <a href={href || to} onClick={onClick} className={className}>
        {children}
      </a>
    </PermissionGuard>
  )
}

export default PermissionGuard
