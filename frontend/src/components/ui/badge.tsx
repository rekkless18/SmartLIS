/**
 * 统一的徽章组件
 * 提供一致的徽章样式和行为
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react'
import { cn } from '../../lib/utils'
import { 
  getStatusConfig, 
  getPriorityConfig, 
  getTypeConfig, 
  badgeBaseClasses 
} from '../../utils/styleUtils'

// 徽章变体类型
export type BadgeVariant = 'default' | 'status' | 'priority' | 'type' | 'success' | 'warning' | 'error' | 'info'

// 徽章属性接口
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  value?: string
  customLabel?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 获取徽章样式
 * @param variant 变体类型
 * @param value 值
 * @param customLabel 自定义标签
 * @returns 样式配置
 */
const getBadgeConfig = (variant: BadgeVariant, value?: string, customLabel?: string) => {
  switch (variant) {
    case 'status':
      return value ? getStatusConfig(value, customLabel) : { 
        label: customLabel || 'Unknown', 
        className: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
    case 'priority':
      return value ? getPriorityConfig(value, customLabel) : { 
        label: customLabel || 'Unknown', 
        className: 'bg-gray-50 text-gray-700 border-gray-200' 
      }
    case 'type':
      return value ? getTypeConfig(value, customLabel) : { 
        label: customLabel || 'Unknown', 
        className: 'bg-gray-50 text-gray-700 border-gray-200' 
      }
    case 'success':
      return {
        label: customLabel || 'Success',
        className: 'bg-green-100 text-green-800 border-green-200'
      }
    case 'warning':
      return {
        label: customLabel || 'Warning',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    case 'error':
      return {
        label: customLabel || 'Error',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    case 'info':
      return {
        label: customLabel || 'Info',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    default:
      return {
        label: customLabel || 'Default',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
  }
}

/**
 * 获取尺寸样式
 * @param size 尺寸
 * @returns CSS类名
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs'
    case 'lg':
      return 'px-3 py-1 text-sm'
    default:
      return 'px-2.5 py-0.5 text-xs'
  }
}

/**
 * 徽章组件
 * @param props 组件属性
 * @returns 徽章组件
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  value,
  customLabel,
  icon,
  size = 'md',
  className,
  children,
  ...props
}) => {
  const config = getBadgeConfig(variant, value, customLabel)
  const sizeClasses = getSizeClasses(size)
  
  const displayText = children || config.label
  
  return (
    <span
      className={cn(
        badgeBaseClasses,
        config.className,
        sizeClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {displayText}
    </span>
  )
}

/**
 * 状态徽章组件
 * @param props 组件属性
 * @returns 状态徽章组件
 */
export const StatusBadge: React.FC<Omit<BadgeProps, 'variant'> & { status: string }> = ({
  status,
  customLabel,
  ...props
}) => {
  return (
    <Badge
      variant="status"
      value={status}
      customLabel={customLabel}
      {...props}
    />
  )
}

/**
 * 优先级徽章组件
 * @param props 组件属性
 * @returns 优先级徽章组件
 */
export const PriorityBadge: React.FC<Omit<BadgeProps, 'variant'> & { priority: string }> = ({
  priority,
  customLabel,
  ...props
}) => {
  return (
    <Badge
      variant="priority"
      value={priority}
      customLabel={customLabel}
      {...props}
    />
  )
}

/**
 * 类型徽章组件
 * @param props 组件属性
 * @returns 类型徽章组件
 */
export const TypeBadge: React.FC<Omit<BadgeProps, 'variant'> & { type: string }> = ({
  type,
  customLabel,
  ...props
}) => {
  return (
    <Badge
      variant="type"
      value={type}
      customLabel={customLabel}
      {...props}
    />
  )
}

export default Badge