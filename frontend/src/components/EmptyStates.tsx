/**
 * 空状态组件集合
 * 提供各种空数据状态的UI组件
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react'
import {
  FileText,
  Search,
  Plus,
  Database,
  Inbox,
  AlertCircle,
  RefreshCw,
  Filter,
  Users,
  Settings,
  Package,
  TestTube,
  FileX
} from 'lucide-react'
import { cn } from '../lib/utils'

// 空状态组件属性接口
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// 预定义的空状态类型
export type EmptyStateType = 
  | 'no-data'
  | 'no-search-results'
  | 'no-filter-results'
  | 'no-submissions'
  | 'no-samples'
  | 'no-experiments'
  | 'no-reports'
  | 'no-users'
  | 'no-notifications'
  | 'error'
  | 'maintenance'

/**
 * 基础空状态组件
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      className
    )}>
      {icon && (
        <div className={cn(
          'text-gray-400 mb-4',
          classes.icon
        )}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-gray-900 mb-2',
        classes.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-gray-600 mb-6 max-w-md',
          classes.description
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
            action.variant === 'secondary'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * 预定义的空状态配置
 */
const emptyStateConfigs: Record<EmptyStateType, {
  icon: React.ReactNode
  title: string
  description: string
}> = {
  'no-data': {
    icon: <Database className="w-full h-full" />,
    title: '暂无数据',
    description: '当前没有任何数据，请稍后再试或联系管理员。'
  },
  'no-search-results': {
    icon: <Search className="w-full h-full" />,
    title: '未找到相关结果',
    description: '请尝试使用其他关键词搜索，或检查搜索条件是否正确。'
  },
  'no-filter-results': {
    icon: <Filter className="w-full h-full" />,
    title: '没有符合条件的数据',
    description: '请调整筛选条件，或清除所有筛选器查看全部数据。'
  },
  'no-submissions': {
    icon: <FileText className="w-full h-full" />,
    title: '暂无送检申请',
    description: '还没有任何送检申请，点击下方按钮创建第一个送检申请。'
  },
  'no-samples': {
    icon: <TestTube className="w-full h-full" />,
    title: '暂无样本',
    description: '还没有任何样本信息，请先接收样本或创建样本记录。'
  },
  'no-experiments': {
    icon: <Package className="w-full h-full" />,
    title: '暂无实验',
    description: '还没有任何实验记录，请先创建实验或等待样本分配。'
  },
  'no-reports': {
    icon: <FileX className="w-full h-full" />,
    title: '暂无报告',
    description: '还没有任何检测报告，请等待实验完成后生成报告。'
  },
  'no-users': {
    icon: <Users className="w-full h-full" />,
    title: '暂无用户',
    description: '还没有任何用户信息，请添加用户或检查权限设置。'
  },
  'no-notifications': {
    icon: <Inbox className="w-full h-full" />,
    title: '暂无通知',
    description: '您目前没有任何新通知，有新消息时会在这里显示。'
  },
  'error': {
    icon: <AlertCircle className="w-full h-full" />,
    title: '加载失败',
    description: '数据加载时出现错误，请检查网络连接或稍后重试。'
  },
  'maintenance': {
    icon: <Settings className="w-full h-full" />,
    title: '系统维护中',
    description: '系统正在进行维护升级，请稍后再试。感谢您的耐心等待。'
  }
}

/**
 * 预定义空状态组件
 */
export const PresetEmptyState: React.FC<{
  type: EmptyStateType
  action?: EmptyStateProps['action']
  className?: string
  size?: EmptyStateProps['size']
}> = ({ type, action, className, size }) => {
  const config = emptyStateConfigs[type]
  
  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={action}
      className={className}
      size={size}
    />
  )
}

/**
 * 搜索结果为空组件
 */
export const NoSearchResults: React.FC<{
  searchTerm?: string
  onClear?: () => void
  className?: string
}> = ({ searchTerm, onClear, className }) => {
  return (
    <EmptyState
      icon={<Search className="w-full h-full" />}
      title={searchTerm ? `未找到"${searchTerm}"的相关结果` : '未找到相关结果'}
      description="请尝试使用其他关键词搜索，或检查搜索条件是否正确。"
      action={onClear ? {
        label: '清除搜索',
        onClick: onClear,
        variant: 'secondary'
      } : undefined}
      className={className}
    />
  )
}

/**
 * 筛选结果为空组件
 */
export const NoFilterResults: React.FC<{
  onClearFilters?: () => void
  className?: string
}> = ({ onClearFilters, className }) => {
  return (
    <EmptyState
      icon={<Filter className="w-full h-full" />}
      title="没有符合条件的数据"
      description="请调整筛选条件，或清除所有筛选器查看全部数据。"
      action={onClearFilters ? {
        label: '清除筛选',
        onClick: onClearFilters,
        variant: 'secondary'
      } : undefined}
      className={className}
    />
  )
}

/**
 * 错误状态组件
 */
export const ErrorState: React.FC<{
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}> = ({ 
  title = '加载失败', 
  description = '数据加载时出现错误，请检查网络连接或稍后重试。',
  onRetry,
  className 
}) => {
  return (
    <EmptyState
      icon={<AlertCircle className="w-full h-full" />}
      title={title}
      description={description}
      action={onRetry ? {
        label: '重试',
        onClick: onRetry
      } : undefined}
      className={className}
    />
  )
}

/**
 * 创建第一个项目的空状态组件
 */
export const CreateFirstItem: React.FC<{
  itemName: string
  description?: string
  onCreate: () => void
  className?: string
}> = ({ itemName, description, onCreate, className }) => {
  return (
    <EmptyState
      icon={<Plus className="w-full h-full" />}
      title={`创建第一个${itemName}`}
      description={description || `还没有任何${itemName}，点击下方按钮开始创建。`}
      action={{
        label: `创建${itemName}`,
        onClick: onCreate
      }}
      className={className}
    />
  )
}

export default EmptyState