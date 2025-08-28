/**
 * 路由守卫组件
 * 保护需要认证的路由，未登录用户重定向到登录页
 * 支持基于权限和角色的路由保护
 * @author Erikwang
 * @date 2025-08-20
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { usePermissions } from '../hooks/usePermissions'
import { useEffect, useState } from 'react'
import Loading from './Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  // 权限要求
  requiredPermission?: string
  requiredPermissions?: string[]
  requiredRole?: string
  requiredRoles?: string[]
  requireAll?: boolean // 是否需要所有权限/角色
  // 无权限时的重定向路径
  unauthorizedRedirect?: string
  // 自定义权限检查
  customPermissionCheck?: () => boolean
}

/**
 * 路由守卫组件
 * @param props 组件属性
 * @returns 受保护的路由组件
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requiredRoles = [],
  requireAll = false,
  unauthorizedRedirect = '/unauthorized',
  customPermissionCheck,
}) => {
  const location = useLocation()
  const { isAuthenticated, checkAuth, setLoading, loading } = useAuthStore()
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccessPage,
    isAdmin,
  } = usePermissions()

  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // 检查认证状态
    setLoading(true)
    setIsChecking(true)

    const isAuth = checkAuth()

    // 立即设置状态，不使用setTimeout
    setLoading(false)
    setIsChecking(false)

    if (!isAuth) {
      console.log('用户未认证，重定向到登录页')
    }
  }, [checkAuth, setLoading])

  // 显示加载状态
  if (loading || isChecking) {
    return <Loading />
  }

  // 如果未认证，重定向到登录页，并保存当前路径
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />
  }

  // 管理员拥有所有权限，直接通过
  if (isAdmin) {
    return <>{children}</>
  }

  // 自定义权限检查
  if (customPermissionCheck) {
    const hasCustomPermission = customPermissionCheck()
    if (!hasCustomPermission) {
      return (
        <Navigate
          to={unauthorizedRedirect}
          state={{
            from: location.pathname,
            reason: 'custom_permission_denied',
          }}
          replace
        />
      )
    }
    return <>{children}</>
  }

  // 检查页面访问权限
  if (!canAccessPage(location.pathname)) {
    console.log(`用户无权限访问页面: ${location.pathname}`)
    return (
      <Navigate
        to={unauthorizedRedirect}
        state={{ from: location.pathname, reason: 'page_access_denied' }}
        replace
      />
    )
  }

  // 检查特定权限要求
  if (requiredPermission || requiredPermissions.length > 0) {
    const allPermissions = [...requiredPermissions]
    if (requiredPermission) allPermissions.push(requiredPermission)

    const hasRequiredPermission = requireAll
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions)

    if (!hasRequiredPermission) {
      console.log(`用户缺少必要权限: ${allPermissions.join(', ')}`)
      return (
        <Navigate
          to={unauthorizedRedirect}
          state={{
            from: location.pathname,
            reason: 'permission_denied',
            requiredPermissions: allPermissions,
          }}
          replace
        />
      )
    }
  }

  // 检查特定角色要求
  if (requiredRole || requiredRoles.length > 0) {
    const allRoles = [...requiredRoles]
    if (requiredRole) allRoles.push(requiredRole)

    const hasRequiredRole = requireAll
      ? hasAllRoles(allRoles)
      : hasAnyRole(allRoles)

    if (!hasRequiredRole) {
      console.log(`用户缺少必要角色: ${allRoles.join(', ')}`)
      return (
        <Navigate
          to={unauthorizedRedirect}
          state={{
            from: location.pathname,
            reason: 'role_denied',
            requiredRoles: allRoles,
          }}
          replace
        />
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
