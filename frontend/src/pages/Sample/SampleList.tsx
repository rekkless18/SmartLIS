/**
 * 样本列表页面
 * 显示样本管理列表
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Package,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { StatusBadge, TypeBadge } from '../../components/ui/badge'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 样本状态选项
const sampleStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待接收', value: 'pending' },
  { label: '已接收', value: 'received' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已销毁', value: 'destroyed' },
]

// 样本类型选项
const sampleTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '水质样本', value: 'water' },
  { label: '土壤样本', value: 'soil' },
  { label: '空气样本', value: 'air' },
  { label: '食品样本', value: 'food' },
  { label: '化学品样本', value: 'chemical' },
  { label: '生物样本', value: 'biological' },
  { label: '其他', value: 'other' },
]

// 样本来源选项
const sampleSourceOptions = [
  { label: '全部来源', value: '' },
  { label: '客户送检', value: 'client' },
  { label: '现场采样', value: 'field' },
  { label: '内部质控', value: 'qc' },
  { label: '标准样品', value: 'standard' },
  { label: '其他', value: 'other' },
]

// 样本数据接口
interface Sample {
  id: string
  sampleCode: string
  sampleName: string
  sampleType: string
  source: string
  quantity: number
  unit: string
  status: string
  receivedDate: string
  receivedBy: string
  description: string
  createdAt: string
}

/**
 * 模拟API调用获取样本数据
 * @returns 样本数据
 */
const fetchSamples = async (): Promise<Sample[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: '1',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      sampleType: 'water',
      source: 'client',
      quantity: 2,
      unit: 'L',
      status: 'received',
      receivedDate: '2025-01-20',
      receivedBy: '张三',
      description: '某化工厂废水处理后样本',
      createdAt: '2025-01-20T10:30:00Z',
    },
    {
      id: '2',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      sampleType: 'soil',
      source: 'field',
      quantity: 5,
      unit: 'kg',
      status: 'processing',
      receivedDate: '2025-01-19',
      receivedBy: '李四',
      description: '农田重金属污染检测样本',
      createdAt: '2025-01-19T14:20:00Z',
    },
    {
      id: '3',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      sampleType: 'air',
      source: 'client',
      quantity: 1,
      unit: '份',
      status: 'completed',
      receivedDate: '2025-01-18',
      receivedBy: '王五',
      description: '新装修房屋空气质量检测',
      createdAt: '2025-01-18T09:15:00Z',
    },
    {
      id: '4',
      sampleCode: 'S2025010004',
      sampleName: '食品添加剂样本',
      sampleType: 'food',
      source: 'qc',
      quantity: 3,
      unit: 'g',
      status: 'pending',
      receivedDate: '2025-01-21',
      receivedBy: '赵六',
      description: '食品添加剂安全性检测',
      createdAt: '2025-01-21T16:45:00Z',
    },
    {
      id: '5',
      sampleCode: 'S2025010005',
      sampleName: '标准参考物质',
      sampleType: 'chemical',
      source: 'standard',
      quantity: 1,
      unit: '个',
      status: 'received',
      receivedDate: '2025-01-20',
      receivedBy: '孙七',
      description: '质量控制标准样品',
      createdAt: '2025-01-20T11:30:00Z',
    },
  ]
}

// 状态标签样式（使用useCallback优化）
const getStatusBadge = (status: string) => {
  return <StatusBadge status={status} />
}

// 类型标签样式（使用useCallback优化）
const getTypeBadge = (type: string) => {
  return <TypeBadge type={type} />
}

const SampleList: React.FC = () => {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  
  // 使用数据缓存Hook
  const {
    data: samples = [],
    loading,
    error,
    refresh,
    updateData,
  } = useDataCache<Sample[]>('samples', fetchSamples)
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  
  // 搜索防抖
  const { debouncedSearchTerm } = useSearchDebounce(
    searchTerm,
    () => {}, // 空的搜索回调，因为我们在useMemo中处理搜索
    300,
    0
  )

  // 筛选和搜索（使用useMemo优化）
  const filteredSamples = useMemo(() => {
    if (!samples) return []
    
    let filtered = samples

    // 搜索筛选
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        sample =>
          sample.sampleCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          sample.sampleName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          sample.receivedBy.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(sample => sample.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(sample => sample.sampleType === typeFilter)
    }

    // 来源筛选
    if (sourceFilter) {
      filtered = filtered.filter(sample => sample.source === sourceFilter)
    }

    // 日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(
        sample => sample.receivedDate >= dateRange.start
      )
    }
    if (dateRange.end) {
      filtered = filtered.filter(sample => sample.receivedDate <= dateRange.end)
    }

    return filtered
  }, [samples, debouncedSearchTerm, statusFilter, typeFilter, sourceFilter, dateRange])
  
  // 统计数据（使用缓存优化）
  const stats = useMemo(() => {
    if (!samples) return { total: 0, pending: 0, received: 0, processing: 0, completed: 0 }
    
    return {
      total: samples.length,
      pending: samples.filter(s => s.status === 'pending').length,
      received: samples.filter(s => s.status === 'received').length,
      processing: samples.filter(s => s.status === 'processing').length,
      completed: samples.filter(s => s.status === 'completed').length,
    }
  }, [samples])

  // 表格列配置
  const columns = [
    {
      key: 'sampleCode',
      title: '样本编号',
      dataIndex: 'sampleCode',
      width: 120,
      render: (value: string, record: Sample) => (
        <div className='font-mono text-sm'>
          <div className='font-medium text-blue-600'>{value}</div>
        </div>
      ),
    },
    {
      key: 'sampleInfo',
      title: '样本信息',
      dataIndex: 'sampleName',
      width: 200,
      render: (value: string, record: Sample) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500 mt-1'>{record.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      title: '类型',
      dataIndex: 'sampleType',
      width: 100,
      render: (value: string) => getTypeBadge(value),
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      render: (value: number, record: Sample) => (
        <span className='text-sm'>
          {value} {record.unit}
        </span>
      ),
    },
    {
      key: 'source',
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (value: string) => {
        const sourceLabels = {
          client: '客户送检',
          field: '现场采样',
          qc: '内部质控',
          standard: '标准样品',
          other: '其他',
        }
        return (
          <span className='text-sm'>
            {sourceLabels[value as keyof typeof sourceLabels] || value}
          </span>
        )
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'receivedInfo',
      title: '接收信息',
      dataIndex: 'receivedDate',
      width: 150,
      render: (value: string, record: Sample) => (
        <div className='text-sm'>
          <div>{value}</div>
          <div className='text-gray-500'>{record.receivedBy}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      render: (record: Sample) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleView(record.id)}
            className='p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
            title='查看详情'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleEdit(record.id)}
            className='p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors'
            title='编辑样本'
          >
            <Edit className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className='p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors'
            title='删除样本'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ]

  // 操作处理函数（使用useCallback优化）
  const handleView = useCallback((id: string) => {
    navigate(`/sample/${id}`)
  }, [navigate])

  const handleEdit = useCallback((id: string) => {
    navigate(`/sample/${id}/edit`)
  }, [navigate])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定要删除这个样本吗？')) return

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      // 使用局部更新优化
      updateData(prevSamples => prevSamples.filter(sample => sample.id !== id))
      toast.success('样本删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败，请重试')
    }
  }, [updateData])

  const handleExport = useCallback(() => {
    toast.info('导出功能开发中...')
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setSourceFilter('')
    setDateRange({ start: '', end: '' })
  }, [setSearchTerm])

  // 错误处理
  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-96 space-y-4'>
        <div className='text-red-500 text-lg font-medium'>加载数据时出现错误</div>
        <div className='text-gray-500'>{error.message}</div>
        <button
          onClick={refresh}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题和操作 */}
      <div className='bg-white rounded-lg shadow-md border p-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>样本管理</h1>
            <p className='text-gray-600 mt-1'>管理实验室样本信息</p>
          </div>
          <div className='flex space-x-3'>
            <button
              onClick={handleExport}
              className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors shadow-sm'
            >
              <Download className='w-4 h-4 mr-2' />
              导出数据
            </button>
            <button
              onClick={() => navigate('/sample/receive')}
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm'
            >
              <Plus className='w-4 h-4 mr-2' />
              接收样本
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <SkeletonLoader type="cards" count={5} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='flex items-center'>
              <Package className='w-8 h-8 text-blue-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>总样本数</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <span className='text-yellow-600 font-bold text-sm'>待</span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>待接收</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <span className='text-blue-600 font-bold text-sm'>收</span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>已接收</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {stats.received}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                <span className='text-orange-600 font-bold text-sm'>处</span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>处理中</p>
                <p className='text-2xl font-bold text-orange-600'>
                  {stats.processing}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                <span className='text-green-600 font-bold text-sm'>完</span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>已完成</p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选和搜索 */}
      <div className='bg-white rounded-lg shadow-md border p-6'>
        <div className='flex items-center space-x-4 mb-4'>
          <Filter className='w-5 h-5 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>筛选条件</h3>
          <button
            onClick={clearFilters}
            className='text-sm text-blue-600 hover:text-blue-800 transition-colors'
          >
            清除筛选
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
          {/* 搜索框 */}
          <div className='lg:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              搜索
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='搜索样本编号、名称或接收人'
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              状态
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {sampleStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 类型筛选 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              类型
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {sampleTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 来源筛选 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              来源
            </label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {sampleSourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 日期范围 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              开始日期
            </label>
            <input
              type='date'
              value={dateRange.start}
              onChange={e =>
                setDateRange(prev => ({ ...prev, start: e.target.value }))
              }
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className='bg-white rounded-lg shadow-md border'>
        <DataTable
          columns={columns}
          dataSource={filteredSamples}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
          rowKey='id'
        />
      </div>
      </div>
    </ErrorBoundary>
  )
}

// 使用memo优化组件
export default memo(SampleList)
