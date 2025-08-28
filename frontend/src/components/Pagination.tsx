/**
 * 通用分页组件
 * 支持多种分页样式、跳转、页码显示等
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * 分页组件属性
 */
export interface PaginationProps {
  /** 当前页码 */
  current: number
  /** 总条数 */
  total: number
  /** 每页条数 */
  pageSize?: number
  /** 每页条数选项 */
  pageSizeOptions?: number[]
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示总数 */
  showTotal?:
    | boolean
    | ((total: number, range: [number, number]) => React.ReactNode)
  /** 是否显示较少页码 */
  showLessItems?: boolean
  /** 是否简单模式 */
  simple?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 分页大小 */
  size?: 'small' | 'default' | 'large'
  /** 页码改变回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 每页条数改变回调 */
  onShowSizeChange?: (current: number, size: number) => void
  /** 自定义样式 */
  className?: string
  /** 自定义项目渲染 */
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    originalElement: React.ReactElement
  ) => React.ReactNode
}

/**
 * 获取分页尺寸样式
 * @param size 尺寸
 * @returns 样式类名
 */
const getPaginationSizeClass = (
  size: 'small' | 'default' | 'large'
): string => {
  const sizeMap = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base',
  }
  return sizeMap[size]
}

/**
 * 获取按钮尺寸样式
 * @param size 尺寸
 * @returns 样式类名
 */
const getButtonSizeClass = (size: 'small' | 'default' | 'large'): string => {
  const sizeMap = {
    small: 'w-6 h-6 text-xs',
    default: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base',
  }
  return sizeMap[size]
}

/**
 * 计算页码范围
 * @param current 当前页
 * @param total 总页数
 * @param showLessItems 是否显示较少项目
 * @returns 页码数组
 */
const calculatePageNumbers = (
  current: number,
  total: number,
  showLessItems: boolean = false
): (number | string)[] => {
  if (total <= 1) return []

  const delta = showLessItems ? 1 : 2
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, 'prev-ellipsis')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('next-ellipsis', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }

  return rangeWithDots
}

/**
 * 通用分页组件
 * @param props 组件属性
 * @returns 分页组件
 */
const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal = false,
  showLessItems = false,
  simple = false,
  disabled = false,
  size = 'default',
  onChange,
  onShowSizeChange,
  className,
  itemRender,
}) => {
  const [jumpValue, setJumpValue] = useState('')

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize)

  // 计算当前显示范围
  const range = useMemo((): [number, number] => {
    const start = (current - 1) * pageSize + 1
    const end = Math.min(current * pageSize, total)
    return [start, end]
  }, [current, pageSize, total])

  // 计算页码数组
  const pageNumbers = useMemo(() => {
    return calculatePageNumbers(current, totalPages, showLessItems)
  }, [current, totalPages, showLessItems])

  /**
   * 处理页码改变
   * @param page 目标页码
   */
  const handlePageChange = (page: number) => {
    if (disabled || page === current || page < 1 || page > totalPages) return
    onChange?.(page, pageSize)
  }

  /**
   * 处理每页条数改变
   * @param newPageSize 新的每页条数
   */
  const handlePageSizeChange = (newPageSize: number) => {
    if (disabled) return
    const newCurrent = Math.min(current, Math.ceil(total / newPageSize))
    onShowSizeChange?.(newCurrent, newPageSize)
    onChange?.(newCurrent, newPageSize)
  }

  /**
   * 处理快速跳转
   */
  const handleQuickJump = () => {
    const page = parseInt(jumpValue)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setJumpValue('')
    }
  }

  /**
   * 渲染页码按钮
   * @param page 页码
   * @param type 类型
   * @returns 按钮组件
   */
  const renderPageItem = (
    page: number | string,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next'
  ) => {
    const isActive = type === 'page' && page === current
    const isDisabled =
      disabled ||
      (type === 'prev' && current <= 1) ||
      (type === 'next' && current >= totalPages)

    const buttonClass = cn(
      'inline-flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors',
      getButtonSizeClass(size),
      isActive && 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700',
      isDisabled && 'opacity-50 cursor-not-allowed hover:bg-white',
      'rounded-md'
    )

    let content: React.ReactNode
    let onClick: (() => void) | undefined

    switch (type) {
      case 'prev':
        content = <ChevronLeft className='w-4 h-4' />
        onClick = () => handlePageChange(current - 1)
        break
      case 'next':
        content = <ChevronRight className='w-4 h-4' />
        onClick = () => handlePageChange(current + 1)
        break
      case 'jump-prev':
        content = <ChevronsLeft className='w-4 h-4' />
        onClick = () => handlePageChange(Math.max(1, current - 5))
        break
      case 'jump-next':
        content = <ChevronsRight className='w-4 h-4' />
        onClick = () => handlePageChange(Math.min(totalPages, current + 5))
        break
      case 'page':
        content = page
        onClick = () => handlePageChange(page as number)
        break
    }

    const element = (
      <button
        key={`${type}-${page}`}
        type='button'
        className={buttonClass}
        onClick={onClick}
        disabled={isDisabled}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    )

    // 自定义渲染
    if (itemRender && type === 'page') {
      return itemRender(page as number, type, element)
    }

    return element
  }

  /**
   * 渲染省略号
   * @param key 键值
   * @param type 类型
   * @returns 省略号组件
   */
  const renderEllipsis = (key: string, type: 'jump-prev' | 'jump-next') => {
    return (
      <button
        key={key}
        type='button'
        className={cn(
          'inline-flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors rounded-md',
          getButtonSizeClass(size),
          disabled && 'opacity-50 cursor-not-allowed hover:bg-white'
        )}
        onClick={() => {
          if (type === 'jump-prev') {
            handlePageChange(Math.max(1, current - 5))
          } else {
            handlePageChange(Math.min(totalPages, current + 5))
          }
        }}
        disabled={disabled}
      >
        <MoreHorizontal className='w-4 h-4' />
      </button>
    )
  }

  // 如果总数为0，不显示分页
  if (total === 0) {
    return null
  }

  // 简单模式
  if (simple) {
    return (
      <div
        className={cn(
          'flex items-center space-x-2',
          getPaginationSizeClass(size),
          className
        )}
      >
        {renderPageItem(current - 1, 'prev')}
        <span className='px-2 text-gray-600'>
          {current} / {totalPages}
        </span>
        {renderPageItem(current + 1, 'next')}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        getPaginationSizeClass(size),
        className
      )}
    >
      {/* 总数显示 */}
      {showTotal && (
        <div className='text-gray-600'>
          {typeof showTotal === 'function'
            ? showTotal(total, range)
            : `共 ${total} 条，第 ${range[0]}-${range[1]} 条`}
        </div>
      )}

      <div className='flex items-center space-x-2'>
        {/* 每页条数选择器 */}
        {showSizeChanger && (
          <div className='flex items-center space-x-2'>
            <span className='text-gray-600'>每页</span>
            <select
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className={cn(
                'border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                disabled && 'opacity-50 cursor-not-allowed',
                size === 'small' && 'text-xs',
                size === 'large' && 'text-base'
              )}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className='text-gray-600'>条</span>
          </div>
        )}

        {/* 页码导航 */}
        <div className='flex items-center space-x-1'>
          {/* 上一页 */}
          {renderPageItem(current - 1, 'prev')}

          {/* 页码 */}
          {pageNumbers.map((page, index) => {
            if (page === 'prev-ellipsis') {
              return renderEllipsis(`prev-ellipsis-${index}`, 'jump-prev')
            }
            if (page === 'next-ellipsis') {
              return renderEllipsis(`next-ellipsis-${index}`, 'jump-next')
            }
            return renderPageItem(page, 'page')
          })}

          {/* 下一页 */}
          {renderPageItem(current + 1, 'next')}
        </div>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className='flex items-center space-x-2'>
            <span className='text-gray-600'>跳至</span>
            <input
              type='number'
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={e => setJumpValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleQuickJump()
                }
              }}
              disabled={disabled}
              className={cn(
                'w-12 border border-gray-300 rounded-md px-2 py-1 text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                disabled && 'opacity-50 cursor-not-allowed',
                size === 'small' && 'text-xs h-6',
                size === 'default' && 'text-sm h-8',
                size === 'large' && 'text-base h-10'
              )}
            />
            <span className='text-gray-600'>页</span>
            <button
              type='button'
              onClick={handleQuickJump}
              disabled={disabled}
              className={cn(
                'px-2 py-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              确定
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination
