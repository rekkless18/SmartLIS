/**
 * 样本销毁页面
 * 样本销毁管理功能页面 - 列表样式展示可销毁样本
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Package,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 样本状态选项
const sampleStatusOptions = [
  { label: '可用', value: 'available' },
  { label: '检测中', value: 'testing' },
  { label: '已完成', value: 'completed' },
  { label: '过期', value: 'expired' },
  { label: '污染', value: 'contaminated' },
  { label: '损坏', value: 'damaged' },
]

// 样本类型选项
const sampleTypeOptions = [
  { label: '水质样本', value: 'water' },
  { label: '土壤样本', value: 'soil' },
  { label: '空气样本', value: 'air' },
  { label: '食品样本', value: 'food' },
  { label: '化学品样本', value: 'chemical' },
  { label: '生物样本', value: 'biological' },
  { label: '其他', value: 'other' },
]

// 样本接口
interface Sample {
  id: string
  sampleCode: string
  sampleName: string
  sampleType: string
  source: string
  quantity: number
  unit: string
  status: string
  receivedAt: string
  location: string
  expiryDate?: string
  notes?: string
}

const SampleDestroy: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [samples, setSamples] = useState<Sample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([])
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 模拟样本数据
  const mockSamples: Sample[] = [
    {
      id: '1',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      sampleType: 'water',
      source: '某化工厂',
      quantity: 2,
      unit: 'L',
      status: 'completed',
      receivedAt: '2025-01-15T09:30:00Z',
      location: 'A区-01号柜',
      expiryDate: '2025-02-15',
      notes: '检测已完成，可销毁',
    },
    {
      id: '2',
      sampleCode: 'S2025010002',
      sampleName: '过期土壤样本',
      sampleType: 'soil',
      source: '某建筑工地',
      quantity: 1.5,
      unit: 'kg',
      status: 'expired',
      receivedAt: '2024-12-20T14:15:00Z',
      location: 'B区-03号柜',
      expiryDate: '2025-01-20',
      notes: '样本已过期',
    },
    {
      id: '3',
      sampleCode: 'S2025010003',
      sampleName: '污染空气样本',
      sampleType: 'air',
      source: '某工业园区',
      quantity: 3,
      unit: '份',
      status: 'contaminated',
      receivedAt: '2025-01-18T11:20:00Z',
      location: 'C区-05号柜',
      notes: '运输过程中受到污染',
    },
    {
      id: '4',
      sampleCode: 'S2025010004',
      sampleName: '损坏食品样本',
      sampleType: 'food',
      source: '某食品厂',
      quantity: 800,
      unit: 'g',
      status: 'damaged',
      receivedAt: '2025-01-16T16:45:00Z',
      location: 'D区-02号柜',
      notes: '包装破损，内容物泄漏',
    },
    {
      id: '5',
      sampleCode: 'S2025010005',
      sampleName: '化学试剂样本',
      sampleType: 'chemical',
      source: '某实验室',
      quantity: 500,
      unit: 'mL',
      status: 'completed',
      receivedAt: '2025-01-12T08:30:00Z',
      location: 'E区-01号柜',
      expiryDate: '2025-03-12',
      notes: '检测完成，剩余样本',
    },
  ]

  // 加载样本数据
  useEffect(() => {
    const loadSamples = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        // 只显示可销毁的样本（已完成、过期、污染、损坏状态）
        const destroyableSamples = mockSamples.filter(sample =>
          ['completed', 'expired', 'contaminated', 'damaged'].includes(
            sample.status
          )
        )
        setSamples(destroyableSamples)
        setFilteredSamples(destroyableSamples)
      } catch (error) {
        console.error('加载样本数据失败:', error)
        toast.error('加载样本数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadSamples()
  }, [])

  // 筛选和搜索
  useEffect(() => {
    let filtered = samples.filter(sample => sample && sample.id) // 确保样本数据有效

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        sample =>
          (sample.sampleCode || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (sample.sampleName || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (sample.source || '').toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredSamples(filtered)
  }, [samples, searchTerm, statusFilter, typeFilter])

  // 处理样本选择
  const handleSelectSample = (sampleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSamples([...selectedSamples, sampleId])
    } else {
      setSelectedSamples(selectedSamples.filter(id => id !== sampleId))
    }
  }

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSamples(filteredSamples.map(sample => sample.id))
    } else {
      setSelectedSamples([])
    }
  }

  // 处理批量销毁
  const handleBatchDestroy = () => {
    if (selectedSamples.length === 0) {
      toast.error('请选择要销毁的样本')
      return
    }
    setShowConfirmDialog(true)
  }

  // 确认销毁
  const confirmDestroy = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 从列表中移除已销毁的样本
      const remainingSamples = samples.filter(
        sample => !selectedSamples.includes(sample.id)
      )
      setSamples(remainingSamples)
      setSelectedSamples([])
      setShowConfirmDialog(false)

      toast.success(`成功销毁 ${selectedSamples.length} 个样本！`)
    } catch (error) {
      console.error('销毁失败:', error)
      toast.error('销毁失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 状态标签样式
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        label: '可用',
        className: 'bg-green-100 text-green-800',
        icon: Package,
      },
      testing: {
        label: '检测中',
        className: 'bg-blue-100 text-blue-800',
        icon: Calendar,
      },
      completed: {
        label: '已完成',
        className: 'bg-purple-100 text-purple-800',
        icon: Package,
      },
      expired: {
        label: '过期',
        className: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
      },
      contaminated: {
        label: '污染',
        className: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
      },
      damaged: {
        label: '损坏',
        className: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: AlertTriangle,
    }
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className='w-3 h-3 mr-1' />
        {config.label}
      </span>
    )
  }

  // 表格列配置
  const columns = [
    {
      key: 'selection',
      title: (
        <input
          type='checkbox'
          checked={
            selectedSamples.length === filteredSamples.length &&
            filteredSamples.length > 0
          }
          onChange={e => handleSelectAll(e.target.checked)}
          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
        />
      ),
      width: 50,
      render: (record: Sample) => {
        if (!record || !record.id) return null
        return (
          <input
            type='checkbox'
            checked={selectedSamples.includes(record.id)}
            onChange={e => handleSelectSample(record.id, e.target.checked)}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
        )
      },
    },
    {
      key: 'sampleCode',
      title: '样本编号',
      dataIndex: 'sampleCode',
      width: 120,
      render: (value: string) => (
        <span className='font-mono text-sm font-medium text-blue-600'>
          {value}
        </span>
      ),
    },
    {
      key: 'sampleInfo',
      title: '样本信息',
      dataIndex: 'sampleName',
      width: 200,
      render: (value: string, record: Sample) => {
        if (!record) return null
        return (
          <div>
            <div className='font-medium text-gray-900'>{value || '-'}</div>
            <div className='text-sm text-gray-500'>
              {sampleTypeOptions.find(opt => opt.value === record.sampleType)
                ?.label || '-'}{' '}
              · {record.quantity || 0} {record.unit || ''}
            </div>
          </div>
        )
      },
    },
    {
      key: 'source',
      title: '样本来源',
      dataIndex: 'source',
      width: 150,
      render: (value: string) => (
        <span className='text-sm text-gray-900'>{value}</span>
      ),
    },
    {
      key: 'location',
      title: '存储位置',
      dataIndex: 'location',
      width: 120,
      render: (value: string) => (
        <span className='text-sm text-gray-600'>{value || '-'}</span>
      ),
    },
    {
      key: 'receivedAt',
      title: '接收时间',
      dataIndex: 'receivedAt',
      width: 150,
      render: (value: string) => {
        if (!value) return <span className='text-sm text-gray-400'>-</span>
        try {
          return (
            <span className='text-sm'>{new Date(value).toLocaleString()}</span>
          )
        } catch {
          return <span className='text-sm text-gray-400'>无效日期</span>
        }
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
      key: 'notes',
      title: '备注',
      dataIndex: 'notes',
      width: 200,
      render: (value: string) => (
        <span className='text-sm text-gray-600' title={value || ''}>
          {value && value.length > 20
            ? `${value.substring(0, 20)}...`
            : value || '-'}
        </span>
      ),
    },
  ]

  // 统计数据
  const stats = {
    total: samples.length,
    completed: samples.filter(s => s && s.status === 'completed').length,
    expired: samples.filter(s => s && s.status === 'expired').length,
    contaminated: samples.filter(s => s && s.status === 'contaminated').length,
    damaged: samples.filter(s => s && s.status === 'damaged').length,
    selected: selectedSamples.length,
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题 */}
      <div className='bg-white rounded-lg shadow-md border p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/sample')}
              className='p-2 hover:bg-gray-100 rounded-md transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>样本销毁管理</h1>
              <p className='text-gray-600 mt-1'>
                管理可销毁样本，支持批量销毁操作
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            {selectedSamples.length > 0 && (
              <span className='text-sm text-gray-600'>
                已选择 {selectedSamples.length} 个样本
              </span>
            )}
            <button
              onClick={handleBatchDestroy}
              disabled={selectedSamples.length === 0}
              className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
            >
              <Trash2 className='w-4 h-4' />
              <span>批量销毁</span>
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
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
            <Package className='w-8 h-8 text-purple-600' />
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>已完成</p>
              <p className='text-2xl font-bold text-purple-600'>
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='w-8 h-8 text-yellow-600' />
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>过期</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {stats.expired}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='w-8 h-8 text-red-600' />
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>污染</p>
              <p className='text-2xl font-bold text-red-600'>
                {stats.contaminated}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='w-8 h-8 text-orange-600' />
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>损坏</p>
              <p className='text-2xl font-bold text-orange-600'>
                {stats.damaged}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border p-4'>
          <div className='flex items-center'>
            <Trash2 className='w-8 h-8 text-gray-600' />
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500'>已选择</p>
              <p className='text-2xl font-bold text-gray-600'>
                {stats.selected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选条件 */}
      <div className='bg-white rounded-lg shadow-md border p-6'>
        <div className='flex items-center space-x-2 mb-4'>
          <Filter className='w-5 h-5 text-gray-600' />
          <h2 className='text-lg font-semibold text-gray-900'>筛选条件</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              搜索
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='搜索样本编号、名称或来源'
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              状态
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>全部状态</option>
              {sampleStatusOptions
                .filter(opt =>
                  ['completed', 'expired', 'contaminated', 'damaged'].includes(
                    opt.value
                  )
                )
                .map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              样本类型
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>全部类型</option>
              {sampleTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setTypeFilter('')
              }}
              className='px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors'
            >
              清除筛选
            </button>
          </div>
        </div>
      </div>

      {/* 样本列表 */}
      <div className='bg-white rounded-lg shadow-md border'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-2'>
              <Trash2 className='w-5 h-5 text-gray-600' />
              <h2 className='text-lg font-semibold text-gray-900'>
                可销毁样本列表
              </h2>
            </div>
            <div className='text-sm text-gray-500'>
              共 {filteredSamples.length} 个样本
            </div>
          </div>

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

      {/* 销毁确认对话框 */}
      {showConfirmDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='flex-shrink-0'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  确认销毁样本
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  您即将销毁 {selectedSamples.length} 个样本，此操作不可撤销。
                </p>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-3 mb-4'>
              <p className='text-sm text-gray-700 font-medium mb-2'>
                将要销毁的样本：
              </p>
              <div className='space-y-1 max-h-32 overflow-y-auto'>
                {samples
                  .filter(s => selectedSamples.includes(s.id))
                  .map(sample => (
                    <div key={sample.id} className='text-sm text-gray-600'>
                      {sample.sampleCode} - {sample.sampleName}
                    </div>
                  ))}
              </div>
            </div>

            <div className='flex space-x-3'>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors'
              >
                取消
              </button>
              <button
                onClick={confirmDestroy}
                disabled={loading}
                className='flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {loading ? '销毁中...' : '确认销毁'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SampleDestroy
