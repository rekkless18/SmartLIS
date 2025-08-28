/**
 * 容器信息组件
 * 用于选择容器规格和自定义容器尺寸
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { Grid, Settings } from 'lucide-react'

// 容器规格接口
interface ContainerSpec {
  rows: number
  cols: number
  name: string
}

// 预设容器规格
const PRESET_SPECS: ContainerSpec[] = [
  { rows: 8, cols: 12, name: '12×8 (96孔板)' },
  { rows: 6, cols: 8, name: '8×6 (48孔板)' },
  { rows: 4, cols: 6, name: '6×4 (24孔板)' },
  { rows: 2, cols: 3, name: '3×2 (6孔板)' },
]

interface ContainerInfoProps {
  onSpecChange: (spec: ContainerSpec) => void
  initialSpec?: ContainerSpec
  compact?: boolean
}

const ContainerInfo: React.FC<ContainerInfoProps> = ({
  onSpecChange,
  initialSpec = PRESET_SPECS[0],
  compact = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('12x8')
  const [customMode, setCustomMode] = useState(false)
  const [customRows, setCustomRows] = useState(8)
  const [customCols, setCustomCols] = useState(12)
  const [currentSpec, setCurrentSpec] = useState<ContainerSpec>(initialSpec)

  // 初始化当前规格
  useEffect(() => {
    setCurrentSpec(initialSpec)
  }, [initialSpec])

  // 处理预设规格选择
  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)
    setCustomMode(false)

    const preset = PRESET_SPECS.find(
      spec => `${spec.cols}x${spec.rows}` === presetKey
    )

    if (preset) {
      setCurrentSpec(preset)
      setCustomRows(preset.rows)
      setCustomCols(preset.cols)
      onSpecChange(preset)
    }
  }

  // 处理自定义模式切换
  const handleCustomModeToggle = () => {
    setCustomMode(!customMode)
    if (!customMode) {
      setSelectedPreset('')
    }
  }

  // 应用自定义规格
  const applyCustomSpec = () => {
    if (
      customRows < 1 ||
      customRows > 20 ||
      customCols < 1 ||
      customCols > 20
    ) {
      alert('行数和列数必须在1-20之间')
      return
    }

    const customSpec: ContainerSpec = {
      rows: customRows,
      cols: customCols,
      name: `${customCols}×${customRows} (自定义)`,
    }

    setCurrentSpec(customSpec)
    onSpecChange(customSpec)
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-lg shadow-md border p-6'}>
      <div
        className={`flex items-center space-x-2 ${compact ? 'mb-2' : 'mb-4'}`}
      >
        <Grid className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
        <h2
          className={`${compact ? 'text-md' : 'text-lg'} font-semibold text-gray-900`}
        >
          容器信息
        </h2>
      </div>

      <div className='space-y-4'>
        {/* 当前规格显示 */}
        <div
          className={`bg-blue-50 border border-blue-200 rounded-lg ${compact ? 'p-2' : 'p-4'}`}
        >
          <div
            className={`flex items-center ${compact ? 'flex-col space-y-1' : 'justify-between'}`}
          >
            <div className={compact ? 'text-center' : ''}>
              <h3
                className={`font-medium text-blue-900 ${compact ? 'text-sm' : ''}`}
              >
                当前容器规格
              </h3>
              <p
                className={`text-blue-700 ${compact ? 'text-xs' : 'text-sm'} mt-1`}
              >
                {compact
                  ? `${currentSpec.cols}×${currentSpec.rows}`
                  : `${currentSpec.name} - 总计 ${currentSpec.rows * currentSpec.cols} 个孔位`}
              </p>
            </div>
            {!compact && (
              <div className='text-right'>
                <div className='text-2xl font-bold text-blue-600'>
                  {currentSpec.cols} × {currentSpec.rows}
                </div>
                <div className='text-xs text-blue-500'>列 × 行</div>
              </div>
            )}
          </div>
        </div>

        {/* 预设规格选择 */}
        <div>
          <h3
            className={`font-medium text-gray-900 ${compact ? 'mb-2 text-sm' : 'mb-3'}`}
          >
            预设规格
          </h3>
          <div
            className={`grid ${compact ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-3'}`}
          >
            {PRESET_SPECS.map(spec => {
              const key = `${spec.cols}x${spec.rows}`
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => handlePresetChange(key)}
                  className={`${compact ? 'p-2' : 'p-3'} text-left border rounded-lg transition-colors ${
                    selectedPreset === key && !customMode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`font-medium ${compact ? 'text-sm' : ''}`}>
                    {compact ? `${spec.cols}×${spec.rows}` : spec.name}
                  </div>
                  {!compact && (
                    <div className='text-sm opacity-75'>
                      {spec.cols} × {spec.rows} = {spec.rows * spec.cols} 孔位
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 自定义规格 */}
        <div>
          <div
            className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}
          >
            <h3
              className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}
            >
              自定义规格
            </h3>
            <button
              type='button'
              onClick={handleCustomModeToggle}
              className={`flex items-center space-x-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md transition-colors ${
                customMode
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <span>
                {compact
                  ? customMode
                    ? '退出'
                    : '自定义'
                  : customMode
                    ? '退出自定义'
                    : '自定义规格'}
              </span>
            </button>
          </div>

          {customMode && (
            <div
              className={`bg-gray-50 border border-gray-200 rounded-lg ${compact ? 'p-2' : 'p-4'}`}
            >
              <div
                className={`grid grid-cols-2 ${compact ? 'gap-2 mb-2' : 'gap-4 mb-4'}`}
              >
                <div>
                  <label
                    className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ${compact ? 'mb-1' : 'mb-2'}`}
                  >
                    列数 (X轴)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='20'
                    value={customCols}
                    onChange={e => setCustomCols(Number(e.target.value))}
                    className={`w-full ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label
                    className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ${compact ? 'mb-1' : 'mb-2'}`}
                  >
                    行数 (Y轴)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='20'
                    value={customRows}
                    onChange={e => setCustomRows(Number(e.target.value))}
                    className={`w-full ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              <div
                className={`flex items-center ${compact ? 'flex-col space-y-1' : 'justify-between'}`}
              >
                <div
                  className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}
                >
                  预览: {customCols} × {customRows} = {customRows * customCols}{' '}
                  个孔位
                </div>
                <button
                  type='button'
                  onClick={applyCustomSpec}
                  className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors`}
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContainerInfo
