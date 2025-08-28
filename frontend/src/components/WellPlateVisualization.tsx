/**
 * 孔位可视化组件
 * 用于显示容器孔位网格，支持孔位选择和状态管理
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Eye, MousePointer } from 'lucide-react'

// 孔位状态枚举
export enum WellStatus {
  EMPTY = 'empty', // 空闲
  OCCUPIED = 'occupied', // 已占用
  SELECTED = 'selected', // 选中
}

// 孔位信息接口
export interface WellInfo {
  id: string
  row: number
  col: number
  position: string // A1, B2 等
  status: WellStatus
  sampleId?: string
  sampleCode?: string
}

// 容器规格接口
interface ContainerSpec {
  rows: number
  cols: number
  name: string
}

interface WellPlateVisualizationProps {
  containerSpec: ContainerSpec
  onWellSelect?: (well: WellInfo) => void
  onWellsChange?: (wells: WellInfo[]) => void
  selectedWells?: string[] // 选中的孔位ID列表
  occupiedWells?: { [wellId: string]: { sampleId: string; sampleCode: string } }
  multiSelect?: boolean // 是否支持多选
}

const WellPlateVisualization: React.FC<WellPlateVisualizationProps> = ({
  containerSpec,
  onWellSelect,
  onWellsChange,
  selectedWells = [],
  occupiedWells = {},
  multiSelect = false,
}) => {
  const [wells, setWells] = useState<WellInfo[]>([])

  // 生成行标签 (A, B, C, ...)
  const getRowLabel = (rowIndex: number): string => {
    return String.fromCharCode(65 + rowIndex) // A=65
  }

  // 生成孔位位置标识 (A1, B2, ...)
  const getWellPosition = (row: number, col: number): string => {
    return `${getRowLabel(row)}${col + 1}`
  }

  // 初始化孔位数据
  const initializeWells = useCallback(() => {
    const newWells: WellInfo[] = []

    for (let row = 0; row < containerSpec.rows; row++) {
      for (let col = 0; col < containerSpec.cols; col++) {
        const position = getWellPosition(row, col)
        const wellId = `${row}-${col}`

        let status = WellStatus.EMPTY
        let sampleId: string | undefined
        let sampleCode: string | undefined

        // 检查是否被占用
        if (occupiedWells[wellId]) {
          status = WellStatus.OCCUPIED
          sampleId = occupiedWells[wellId].sampleId
          sampleCode = occupiedWells[wellId].sampleCode
        }
        // 检查是否被选中
        else if (selectedWells.includes(wellId)) {
          status = WellStatus.SELECTED
        }

        newWells.push({
          id: wellId,
          row,
          col,
          position,
          status,
          sampleId,
          sampleCode,
        })
      }
    }

    return newWells
  }, [containerSpec.rows, containerSpec.cols, selectedWells, occupiedWells])

  // 更新孔位数据
  useEffect(() => {
    setWells(initializeWells())
  }, [initializeWells])

  // 处理孔位点击
  const handleWellClick = (well: WellInfo) => {
    if (well.status === WellStatus.OCCUPIED) {
      return // 已占用的孔位不能选择
    }

    let newStatus: WellStatus
    if (well.status === WellStatus.SELECTED) {
      newStatus = WellStatus.EMPTY
    } else {
      newStatus = WellStatus.SELECTED
    }

    const updatedWells = wells.map(w => {
      if (w.id === well.id) {
        return { ...w, status: newStatus }
      }
      // 如果不支持多选，清除其他选中状态
      if (
        !multiSelect &&
        newStatus === WellStatus.SELECTED &&
        w.status === WellStatus.SELECTED
      ) {
        return { ...w, status: WellStatus.EMPTY }
      }
      return w
    })

    setWells(updatedWells)

    // 调用回调函数
    if (onWellSelect) {
      onWellSelect({ ...well, status: newStatus })
    }
    if (onWellsChange) {
      onWellsChange(updatedWells)
    }
  }

  // 获取孔位样式
  const getWellStyle = (well: WellInfo): string => {
    const baseStyle =
      'w-8 h-8 border-2 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium'

    switch (well.status) {
      case WellStatus.EMPTY:
        return `${baseStyle} bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:border-gray-400`
      case WellStatus.OCCUPIED:
        return `${baseStyle} bg-blue-500 border-blue-600 text-white cursor-not-allowed`
      case WellStatus.SELECTED:
        return `${baseStyle} bg-green-500 border-green-600 text-white hover:bg-green-600`
      default:
        return baseStyle
    }
  }

  // 获取统计信息
  const getStatistics = () => {
    const total = wells.length
    const occupied = wells.filter(w => w.status === WellStatus.OCCUPIED).length
    const selected = wells.filter(w => w.status === WellStatus.SELECTED).length
    const empty = total - occupied - selected

    return { total, occupied, selected, empty }
  }

  const stats = getStatistics()

  return (
    <div className='bg-white rounded-lg shadow-md border p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <Eye className='w-5 h-5 text-blue-600' />
          <h2 className='text-lg font-semibold text-gray-900'>孔位可视化</h2>
        </div>
        <div className='text-sm text-gray-600'>{containerSpec.name}</div>
      </div>

      {/* 统计信息 */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-gray-50 rounded-lg p-3 text-center'>
          <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
          <div className='text-xs text-gray-600'>总孔位</div>
        </div>
        <div className='bg-blue-50 rounded-lg p-3 text-center'>
          <div className='text-2xl font-bold text-blue-600'>
            {stats.occupied}
          </div>
          <div className='text-xs text-blue-600'>已占用</div>
        </div>
        <div className='bg-green-50 rounded-lg p-3 text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {stats.selected}
          </div>
          <div className='text-xs text-green-600'>已选中</div>
        </div>
        <div className='bg-gray-50 rounded-lg p-3 text-center'>
          <div className='text-2xl font-bold text-gray-600'>{stats.empty}</div>
          <div className='text-xs text-gray-600'>空闲</div>
        </div>
      </div>

      {/* 图例 */}
      <div className='flex items-center space-x-6 mb-4 text-sm'>
        <div className='flex items-center space-x-2'>
          <div className='w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded'></div>
          <span className='text-gray-600'>空闲</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded'></div>
          <span className='text-gray-600'>已占用</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='w-4 h-4 bg-green-500 border-2 border-green-600 rounded'></div>
          <span className='text-gray-600'>选中</span>
        </div>
      </div>

      {/* 孔位网格 */}
      <div className='bg-gray-50 rounded-lg p-4 overflow-auto'>
        <div className='inline-block min-w-full'>
          {/* 列标题 */}
          <div className='flex mb-2'>
            <div className='w-8 h-6'></div> {/* 空白角落 */}
            {Array.from({ length: containerSpec.cols }, (_, colIndex) => (
              <div
                key={colIndex}
                className='w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600'
              >
                {colIndex + 1}
              </div>
            ))}
          </div>

          {/* 孔位行 */}
          {Array.from({ length: containerSpec.rows }, (_, rowIndex) => (
            <div key={rowIndex} className='flex mb-1'>
              {/* 行标题 */}
              <div className='w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600'>
                {getRowLabel(rowIndex)}
              </div>

              {/* 该行的孔位 */}
              {Array.from({ length: containerSpec.cols }, (_, colIndex) => {
                const well = wells.find(
                  w => w.row === rowIndex && w.col === colIndex
                )
                if (!well) return null

                return (
                  <div
                    key={well.id}
                    className={getWellStyle(well)}
                    onClick={() => handleWellClick(well)}
                    title={`${well.position}${well.sampleCode ? ` - ${well.sampleCode}` : ''}`}
                  >
                    {well.status === WellStatus.OCCUPIED && (
                      <MousePointer className='w-3 h-3' />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WellPlateVisualization
