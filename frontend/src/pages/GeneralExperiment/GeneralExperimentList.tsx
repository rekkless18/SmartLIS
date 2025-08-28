/**
 * 普检实验列表页面
 * 显示所有普检实验，支持搜索、筛选、排序和分页
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
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/ui/badge'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 实验状态选项
const experimentStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '异常', value: 'error' },
  { label: '已取消', value: 'cancelled' },
]

// 实验类型选项
const experimentTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '水质检测', value: 'water_test' },
  { label: '土壤检测', value: 'soil_test' },
  { label: '空气检测', value: 'air_test' },
  { label: '食品检测', value: 'food_test' },
  { label: '化学分析', value: 'chemical_analysis' },
  { label: '微生物检测', value: 'microbial_test' },
  { label: '其他', value: 'other' },
]

// 优先级选项
const priorityOptions = [
  { label: '全部优先级', value: '' },
  { label: '紧急', value: 'urgent' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

// 实验数据接口
interface Experiment {
  id: string
  experimentCode: string
  experimentName: string
  experimentType: string
  sampleCode: string
  sampleName: string
  status: string
  priority: string
  assignedTo: string
  startDate: string
  endDate: string
  estimatedDuration: number // 预计时长（小时）
  actualDuration?: number // 实际时长（小时）
  progress: number // 进度百分比
  description: string
  createdAt: string
  updatedAt: string
}

// 状态标签样式
const getStatusBadge = (status: string) => {
  const iconMap = {
    pending: <Clock className='w-3 h-3' />,
    running: <FlaskConical className='w-3 h-3' />,
    completed: <CheckCircle className='w-3 h-3' />,
    paused: <Clock className='w-3 h-3' />,
    error: <XCircle className='w-3 h-3' />,
    cancelled: <XCircle className='w-3 h-3' />,
  }
  
  const icon = iconMap[status as keyof typeof iconMap]
  return <StatusBadge status={status} icon={icon} />
}

// 优先级标签样式
const getPriorityBadge = (priority: string) => {
  return <PriorityBadge priority={priority} />
}

// 实验类型标签样式
const getTypeBadge = (type: string) => {
  const typeConfig = {
    water_test: {
      label: '水质检测',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    soil_test: {
      label: '土壤检测',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    air_test: {
      label: '空气检测',
      className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    food_test: {
      label: '食品检测',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    chemical_analysis: {
      label: '化学分析',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    microbial_test: {
      label: '微生物检测',
      className: 'bg-pink-50 text-pink-700 border-pink-200',
    },
    other: {
      label: '其他',
      className: 'bg-gray-50 text-gray-700 border-gray-200',
    },
  }

  const config = typeConfig[type as keyof typeof typeConfig] || {
    label: type,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}

// 进度条组件
const ProgressBar: React.FC<{ progress: number; status: string }> = ({
  progress,
  status,
}) => {
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'running':
        return 'bg-blue-500'
      case 'paused':
        return 'bg-orange-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className='w-full'>
      <div className='flex justify-between text-xs text-gray-600 mb-1'>
        <span>进度</span>
        <span>{progress}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

const ExperimentList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>(
    []
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // 模拟实验数据
  const mockExperiments: Experiment[] = [
    {
      id: '1',
      experimentCode: 'EXP2025010001',
      experimentName: '工业废水COD检测',
      experimentType: 'water_test',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      status: 'running',
      priority: 'high',
      assignedTo: '张三',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      estimatedDuration: 48,
      actualDuration: 24,
      progress: 65,
      description: '检测工业废水中的化学需氧量',
      createdAt: '2025-01-20T09:00:00Z',
      updatedAt: '2025-01-21T14:30:00Z',
    },
    {
      id: '2',
      experimentCode: 'EXP2025010002',
      experimentName: '土壤重金属分析',
      experimentType: 'soil_test',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      status: 'pending',
      priority: 'medium',
      assignedTo: '李四',
      startDate: '2025-01-22',
      endDate: '2025-01-25',
      estimatedDuration: 72,
      progress: 0,
      description: '检测土壤中铅、汞、镉等重金属含量',
      createdAt: '2025-01-19T16:20:00Z',
      updatedAt: '2025-01-19T16:20:00Z',
    },
    {
      id: '3',
      experimentCode: 'EXP2025010003',
      experimentName: '室内空气甲醛检测',
      experimentType: 'air_test',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      status: 'completed',
      priority: 'urgent',
      assignedTo: '王五',
      startDate: '2025-01-18',
      endDate: '2025-01-19',
      estimatedDuration: 24,
      actualDuration: 20,
      progress: 100,
      description: '检测新装修房屋室内空气甲醛含量',
      createdAt: '2025-01-18T08:15:00Z',
      updatedAt: '2025-01-19T17:45:00Z',
    },
    {
      id: '4',
      experimentCode: 'EXP2025010004',
      experimentName: '食品添加剂检测',
      experimentType: 'food_test',
      sampleCode: 'S2025010004',
      sampleName: '食品添加剂样本',
      status: 'paused',
      priority: 'low',
      assignedTo: '赵六',
      startDate: '2025-01-21',
      endDate: '2025-01-24',
      estimatedDuration: 60,
      actualDuration: 12,
      progress: 30,
      description: '检测食品添加剂中的防腐剂含量',
      createdAt: '2025-01-21T10:30:00Z',
      updatedAt: '2025-01-21T18:00:00Z',
    },
    {
      id: '5',
      experimentCode: 'EXP2025010005',
      experimentName: '微生物培养检测',
      experimentType: 'microbial_test',
      sampleCode: 'S2025010005',
      sampleName: '水质样本',
      status: 'error',
      priority: 'high',
      assignedTo: '孙七',
      startDate: '2025-01-20',
      endDate: '2025-01-23',
      estimatedDuration: 72,
      actualDuration: 36,
      progress: 45,
      description: '检测水样中的大肠杆菌等微生物指标',
      createdAt: '2025-01-20T14:00:00Z',
      updatedAt: '2025-01-21T11:15:00Z',
    },
  ]

  // 加载实验数据
  useEffect(() => {
    const loadExperiments = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        setExperiments(mockExperiments)
        setFilteredExperiments(mockExperiments)
      } catch (error) {
        console.error('加载实验数据失败:', error)
        toast.error('加载实验数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadExperiments()
  }, [])

  // 筛选和搜索
  useEffect(() => {
    let filtered = experiments

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        experiment =>
          experiment.experimentCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          experiment.experimentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          experiment.sampleCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          experiment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(
        experiment => experiment.status === statusFilter
      )
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(
        experiment => experiment.experimentType === typeFilter
      )
    }

    // 优先级筛选
    if (priorityFilter) {
      filtered = filtered.filter(
        experiment => experiment.priority === priorityFilter
      )
    }

    // 日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(
        experiment => experiment.startDate >= dateRange.start
      )
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        experiment => experiment.endDate <= dateRange.end
      )
    }

    setFilteredExperiments(filtered)
  }, [
    experiments,
    searchTerm,
    statusFilter,
    typeFilter,
    priorityFilter,
    dateRange,
  ])

  // 表格列配置
  const columns = [
    {
      key: 'experimentCode',
      title: '实验编号',
      dataIndex: 'experimentCode',
      width: 130,
      render: (value: string, record: Experiment) => (
        <div className='font-mono text-sm'>
          <div className='font-medium text-blue-600'>{value}</div>
          <div className='text-xs text-gray-500'>{record.sampleCode}</div>
        </div>
      ),
    },
    {
      key: 'experimentInfo',
      title: '实验信息',
      dataIndex: 'experimentName',
      width: 220,
      render: (value: string, record: Experiment) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500 mt-1'>{record.sampleName}</div>
          <div className='text-xs text-gray-400 mt-1'>{record.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      title: '类型',
      dataIndex: 'experimentType',
      width: 120,
      render: (value: string) => getTypeBadge(value),
    },
    {
      key: 'priority',
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      render: (value: string) => getPriorityBadge(value),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'progress',
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      render: (value: number, record: Experiment) => (
        <ProgressBar progress={value} status={record.status} />
      ),
    },
    {
      key: 'assignedTo',
      title: '负责人',
      dataIndex: 'assignedTo',
      width: 80,
      render: (value: string) => (
        <span className='text-sm font-medium'>{value}</span>
      ),
    },
    {
      key: 'duration',
      title: '时长',
      dataIndex: 'estimatedDuration',
      width: 100,
      render: (value: number, record: Experiment) => (
        <div className='text-sm'>
          <div>预计: {value}h</div>
          {record.actualDuration && (
            <div className='text-gray-500'>实际: {record.actualDuration}h</div>
          )}
        </div>
      ),
    },
    {
      key: 'dateRange',
      title: '时间范围',
      dataIndex: 'startDate',
      width: 140,
      render: (value: string, record: Experiment) => (
        <div className='text-sm'>
          <div>开始: {value}</div>
          <div className='text-gray-500'>结束: {record.endDate}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      render: (record: Experiment) => (
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
            title='编辑实验'
          >
            <Edit className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className='p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors'
            title='删除实验'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ]

  // 操作处理函数
  const handleView = (id: string) => {
    navigate(`/experiment/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/experiment/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个实验吗？')) return

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setExperiments(experiments.filter(experiment => experiment.id !== id))
      toast.success('实验删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败，请重试')
    }
  }

  const handleExport = () => {
    toast.info('导出功能开发中...')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setPriorityFilter('')
    setDateRange({ start: '', end: '' })
  }

  // 统计数据
  const stats = {
    total: experiments.length,
    pending: experiments.filter(e => e.status === 'pending').length,
    running: experiments.filter(e => e.status === 'running').length,
    completed: experiments.filter(e => e.status === 'completed').length,
    error: experiments.filter(e => e.status === 'error').length,
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>普检实验管理</h1>
          <p className='text-gray-600 mt-1'>管理和跟踪所有普检实验进度</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={handleExport}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            <Download className='w-4 h-4 mr-2' />
            导出数据
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <FlaskConical className='h-8 w-8 text-gray-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>总实验数</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Clock className='h-8 w-8 text-yellow-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>待开始</p>
              <p className='text-2xl font-semibold text-yellow-600'>
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <FlaskConical className='h-8 w-8 text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>进行中</p>
              <p className='text-2xl font-semibold text-blue-600'>
                {stats.running}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CheckCircle className='h-8 w-8 text-green-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>已完成</p>
              <p className='text-2xl font-semibold text-green-600'>
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <XCircle className='h-8 w-8 text-red-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>异常</p>
              <p className='text-2xl font-semibold text-red-600'>
                {stats.error}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
          {/* 搜索框 */}
          <div className='lg:col-span-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='搜索实验编号、名称、样本编号或负责人...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* 状态筛选 */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {experimentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 类型筛选 */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {experimentTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 优先级筛选 */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 清除筛选 */}
          <div>
            <button
              onClick={clearFilters}
              className='w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
            >
              <Filter className='w-4 h-4 mr-2 inline' />
              清除筛选
            </button>
          </div>
        </div>

        {/* 日期范围筛选 */}
        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              结束日期
            </label>
            <input
              type='date'
              value={dateRange.end}
              onChange={e =>
                setDateRange(prev => ({ ...prev, end: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>
      </div>

      {/* 实验列表 */}
      <div className='bg-white rounded-lg shadow'>
        <DataTable
          dataSource={filteredExperiments}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  )
}

export default ExperimentList
