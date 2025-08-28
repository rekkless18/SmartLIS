/**
 * 加载组件
 * 用于页面懒加载时显示loading状态
 * @author Erikwang
 * @date 2025-08-20
 */

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  inline?: boolean // 是否为内联模式，用于按钮等小组件内
}

/**
 * 加载组件
 * @param size 尺寸大小
 * @param text 加载文本
 * @param inline 是否为内联模式
 * @returns 加载组件
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = '加载中...',
  inline = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  // 内联模式：用于按钮等小组件内
  if (inline) {
    return (
      <div className='flex items-center space-x-2'>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-current`} />
        {text && <span className='text-sm'>{text}</span>}
      </div>
    )
  }

  // 页面模式：用于页面级加载
  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] space-y-2'>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <p className='text-sm text-gray-600'>{text}</p>
    </div>
  )
}

export default LoadingSpinner
