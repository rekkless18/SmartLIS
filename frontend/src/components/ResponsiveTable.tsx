/**
 * 响应式表格组件
 * 在移动端显示为卡片列表，在桌面端显示为表格
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react'
import { cn } from '../lib/utils'
import DataTable, { DataTableProps, TableColumn } from './DataTable'

/**
 * 响应式表格属性接口
 */
export interface ResponsiveTableProps<T = any> extends DataTableProps<T> {
  mobileCardRender?: (record: T, index: number) => React.ReactNode
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * 默认移动端卡片渲染函数
 * @param record 数据记录
 * @param columns 列配置
 * @param actions 操作按钮
 * @param index 索引
 * @returns 卡片JSX
 */
const defaultMobileCardRender = <T extends Record<string, any>>(
  record: T,
  columns: TableColumn<T>[],
  actions?: any[],
  index?: number
) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {columns.map((column) => {
        if (!column.dataIndex && !column.render) return null
        
        const value = column.dataIndex ? record[column.dataIndex] : undefined
        const displayValue = column.render 
          ? column.render(value, record, index || 0)
          : value
        
        return (
          <div key={column.key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600 flex-shrink-0 w-1/3">
              {column.title}
            </span>
            <div className="text-sm text-gray-900 flex-1 text-right">
              {displayValue}
            </div>
          </div>
        )
      })}
      
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {actions.map((action) => {
            const disabled = action.disabled?.(record) || false
            return (
              <button
                key={action.key}
                onClick={() => !disabled && action.onClick(record, index || 0)}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  action.type === 'primary' &&
                    'bg-blue-100 text-blue-700 hover:bg-blue-200',
                  action.type === 'danger' &&
                    'bg-red-100 text-red-700 hover:bg-red-200',
                  (!action.type || action.type === 'default') &&
                    'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {action.icon && (
                  <span className="mr-1">{action.icon}</span>
                )}
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * 响应式表格组件
 * @param props 组件属性
 * @returns 响应式表格组件
 */
const ResponsiveTable = <T extends Record<string, any>>({
  mobileCardRender,
  breakpoint = 'md',
  columns,
  dataSource,
  actions,
  loading,
  pagination,
  searchable,
  searchPlaceholder,
  onSearch,
  className,
  ...props
}: ResponsiveTableProps<T>) => {
  const breakpointClass = {
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block',
    xl: 'xl:block'
  }[breakpoint]

  const hiddenClass = {
    sm: 'sm:hidden',
    md: 'md:hidden', 
    lg: 'lg:hidden',
    xl: 'xl:hidden'
  }[breakpoint]

  return (
    <div className={className}>
      {/* 桌面端表格 */}
      <div className={cn('hidden', breakpointClass)}>
        <DataTable
          columns={columns}
          dataSource={dataSource}
          actions={actions}
          loading={loading}
          pagination={pagination}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          {...props}
        />
      </div>

      {/* 移动端卡片列表 */}
      <div className={cn('block', hiddenClass)}>
        {/* 搜索栏 */}
        {searchable && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder || '搜索...'}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-8 bg-white border border-gray-200 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        )}

        {/* 空数据状态 */}
        {!loading && dataSource.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg">
            暂无数据
          </div>
        )}

        {/* 卡片列表 */}
        {!loading && dataSource.length > 0 && (
          <div className="space-y-4">
            {dataSource.map((record, index) => {
              if (mobileCardRender) {
                return (
                  <div key={index}>
                    {mobileCardRender(record, index)}
                  </div>
                )
              }
              
              return (
                <div key={index}>
                  {defaultMobileCardRender(record, columns, actions, index)}
                </div>
              )
            })}
          </div>
        )}

        {/* 移动端分页 */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mt-4">
            <div className="text-sm text-gray-700">
              第 {pagination.current} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onChange?.(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current <= 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => pagination.onChange?.(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponsiveTable