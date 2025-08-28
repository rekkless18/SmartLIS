/**
 * 包裹信息组件
 * 用于输入包裹相关信息
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

// 包裹信息接口
export interface PackageData {
  packageCode?: string
  packageDescription?: string
  packageDate?: string
  packageSource?: string
}

interface PackageInfoProps {
  onDataChange?: (data: PackageData) => void
  initialData?: PackageData
  disabled?: boolean
  compact?: boolean
}

const PackageInfo: React.FC<PackageInfoProps> = ({
  onDataChange,
  initialData = {},
  disabled = false,
  compact = false,
}) => {
  const [packageData, setPackageData] = useState<PackageData>({
    packageCode: '',
    packageDescription: '',
    packageDate: new Date().toISOString().split('T')[0],
    packageSource: '',
    ...initialData,
  })

  // 初始化数据
  useEffect(() => {
    setPackageData({
      packageCode: '',
      packageDescription: '',
      packageDate: new Date().toISOString().split('T')[0],
      packageSource: '',
      ...initialData,
    })
  }, [initialData])

  // 处理数据变化
  const handleDataChange = (field: keyof PackageData, value: string) => {
    const newData = {
      ...packageData,
      [field]: value,
    }

    setPackageData(newData)

    if (onDataChange) {
      onDataChange(newData)
    }
  }

  // 清空表单
  const clearForm = () => {
    const emptyData: PackageData = {
      packageCode: '',
      packageDescription: '',
      packageDate: new Date().toISOString().split('T')[0],
      packageSource: '',
    }

    setPackageData(emptyData)

    if (onDataChange) {
      onDataChange(emptyData)
    }
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-lg shadow-md border p-6'}>
      <div
        className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}
      >
        <div className='flex items-center space-x-2'>
          <Package
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-purple-600`}
          />
          <h2
            className={`${compact ? 'text-md' : 'text-lg'} font-semibold text-gray-900`}
          >
            包裹信息
          </h2>
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
            (可选)
          </span>
        </div>
        {!compact && (
          <button
            type='button'
            onClick={clearForm}
            disabled={disabled}
            className='text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            清空
          </button>
        )}
      </div>

      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {/* 包裹编号 */}
        <div
          className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}
        >
          <div>
            <label
              className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ${compact ? 'mb-1' : 'mb-2'}`}
            >
              包裹编号
            </label>
            <input
              type='text'
              value={packageData.packageCode || ''}
              onChange={e => handleDataChange('packageCode', e.target.value)}
              placeholder={compact ? '包裹编号' : '请输入包裹编号（可选）'}
              disabled={disabled}
              className={`w-full ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
          </div>

          {!compact && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                包裹日期
              </label>
              <input
                type='date'
                value={packageData.packageDate || ''}
                onChange={e => handleDataChange('packageDate', e.target.value)}
                disabled={disabled}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
              />
            </div>
          )}
        </div>

        {!compact && (
          /* 包裹来源 */
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              包裹来源
            </label>
            <select
              value={packageData.packageSource || ''}
              onChange={e => handleDataChange('packageSource', e.target.value)}
              disabled={disabled}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            >
              <option value=''>请选择包裹来源（可选）</option>
              <option value='express'>快递配送</option>
              <option value='self_delivery'>自送</option>
              <option value='pickup'>上门取样</option>
              <option value='internal'>内部流转</option>
              <option value='other'>其他</option>
            </select>
          </div>
        )}

        {/* 包裹描述 */}
        <div>
          <label
            className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ${compact ? 'mb-1' : 'mb-2'}`}
          >
            包裹描述
          </label>
          <textarea
            value={packageData.packageDescription || ''}
            onChange={e =>
              handleDataChange('packageDescription', e.target.value)
            }
            placeholder={compact ? '包裹描述' : '请输入包裹描述信息（可选）'}
            rows={compact ? 2 : 3}
            disabled={disabled}
            className={`w-full ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none`}
          />
        </div>
      </div>

      {/* 信息提示 */}
      {!compact && (
        <div className='mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg'>
          <div className='flex items-start space-x-2'>
            <Package className='w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0' />
            <div className='text-sm text-purple-700'>
              <div className='font-medium mb-1'>包裹信息说明</div>
              <ul className='text-xs space-y-1 text-purple-600'>
                <li>• 包裹信息为可选填写，用于记录样本的包装和运输信息</li>
                <li>• 包裹编号可以是快递单号、内部流转单号等</li>
                <li>• 包裹描述可以记录包装方式、运输条件等详细信息</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageInfo
