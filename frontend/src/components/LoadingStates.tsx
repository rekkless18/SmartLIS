/**
 * 加载状态组件集合
 * 提供各种加载状态的UI组件
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

// 加载组件属性接口
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

// 页面加载组件属性接口
interface PageLoadingProps extends LoadingProps {
  fullScreen?: boolean
}

// 按钮加载组件属性接口
interface ButtonLoadingProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

// 表格加载组件属性接口
interface TableLoadingProps {
  rows?: number
  columns?: number
  className?: string
}

/**
 * 基础加载旋转器
 */
export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

/**
 * 页面级加载组件
 */
export const PageLoading: React.FC<PageLoadingProps> = ({
  size = 'lg',
  text = '加载中...',
  fullScreen = false,
  className
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center">
        <LoadingSpinner size={size} />
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  )
}

/**
 * 内联加载组件
 */
export const InlineLoading: React.FC<LoadingProps> = ({
  size = 'sm',
  text,
  className
}) => {
  return (
    <div className={cn('inline-flex items-center', className)}>
      <LoadingSpinner size={size} />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

/**
 * 按钮加载组件
 */
export const LoadingButton: React.FC<ButtonLoadingProps> = ({
  loading = false,
  children,
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'bg-blue-600 text-white hover:bg-blue-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  )
}

/**
 * 表格加载骨架屏
 */
export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  className
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * 卡片加载骨架屏
 */
export const CardLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  )
}

/**
 * 列表加载骨架屏
 */
export const ListLoading: React.FC<{
  items?: number
  className?: string
}> = ({ items = 3, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 刷新加载组件
 */
export const RefreshLoading: React.FC<{
  onRefresh?: () => void
  loading?: boolean
  className?: string
}> = ({ onRefresh, loading = false, className }) => {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={cn(
        'inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className={cn('w-4 h-4 mr-1', loading && 'animate-spin')} />
      刷新
    </button>
  )
}

/**
 * 延迟加载组件（防止闪烁）
 */
export const DelayedLoading: React.FC<{
  delay?: number
  children: React.ReactNode
}> = ({ delay = 200, children }) => {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!show) return null
  return <>{children}</>
}

/**
 * 加载状态管理Hook
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState)

  const startLoading = React.useCallback(() => setLoading(true), [])
  const stopLoading = React.useCallback(() => setLoading(false), [])
  const toggleLoading = React.useCallback(() => setLoading(prev => !prev), [])

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading
  }
}

export default LoadingSpinner