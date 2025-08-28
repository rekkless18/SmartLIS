/**
 * 质谱实验列表页面
 * 显示所有质谱实验，支持搜索、筛选、排序和分页
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Eye, Edit, Trash2, Download } from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 质谱实验状态选项
const statusOptions = [
  { value: 'pending', label: '待开始', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'running', label: '进行中', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: '失败', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: '已取消', color: 'bg-gray-100 text-gray-800' },
]

// 实验类型选项
const typeOptions = [
  { value: 'lc-ms', label: 'LC-MS' },
  { value: 'gc-ms', label: 'GC-MS' },
  { value: 'ms-ms', label: 'MS/MS' },
  { value: 'maldi-tof', label: 'MALDI-TOF' },
  { value: 'esi-ms', label: 'ESI-MS' },
]

// 优先级选项
const priorityOptions = [
  { value: 'low', label: '低', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: '普通', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800' },
]

// 质谱实验接口
interface MassSpecExperiment {
  id: string
  experimentNo: string
  sampleId: string
  sampleName: string
  experimentType: string
  method: string
  operator: string
  status: string
  priority: string
  startTime: string
  endTime?: string
  duration?: number
  instrument: string
  dataSize: number
  createdAt: string
  updatedAt: string
}

/**
 * 模拟API调用获取质谱实验数据
 * @returns 质谱实验数据
 */
const fetchMassSpecExperiments = async (): Promise<MassSpecExperiment[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: '1',
      experimentNo: 'MS-2025-001',
      sampleId: 'S-2025-001',
      sampleName: '血清样本A',
      experimentType: 'lc-ms',
      method: '蛋白质组学分析',
      operator: '张三',
      status: 'completed',
      priority: 'high',
      startTime: '2025-01-20 09:00:00',
      endTime: '2025-01-20 15:30:00',
      duration: 390,
      instrument: 'LC-MS-8060',
      dataSize: 2.5,
      createdAt: '2025-01-20 08:30:00',
      updatedAt: '2025-01-20 15:30:00',
    },
    {
      id: '2',
      experimentNo: 'MS-2025-002',
      sampleId: 'S-2025-002',
      sampleName: '尿液样本B',
      experimentType: 'gc-ms',
      method: '代谢组学分析',
      operator: '李四',
      status: 'running',
      priority: 'normal',
      startTime: '2025-01-21 10:00:00',
      instrument: 'GC-MS-QP2020',
      dataSize: 1.8,
      createdAt: '2025-01-21 09:30:00',
      updatedAt: '2025-01-21 10:00:00',
    },
    {
      id: '3',
      experimentNo: 'MS-2025-003',
      sampleId: 'S-2025-003',
      sampleName: '组织样本C',
      experimentType: 'maldi-tof',
      method: '蛋白质鉴定',
      operator: '王五',
      status: 'pending',
      priority: 'urgent',
      startTime: '2025-01-22 14:00:00',
      instrument: 'MALDI-TOF-5800',
      dataSize: 0,
      createdAt: '2025-01-21 16:00:00',
      updatedAt: '2025-01-21 16:00:00',
    },
  ]
}

/**
 * 质谱实验列表页面组件
 * @returns 质谱实验列表页面
 */
const MassSpecList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  
  // 使用数据缓存Hook
  const {
    data: experiments = [],
    loading,
    error,
    refresh,
    updateData,
  } = useDataCache<MassSpecExperiment[]>('massSpecExperiments', fetchMassSpecExperiments)
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  
  // 搜索防抖
  const { debouncedSearchTerm } = useSearchDebounce(
    searchTerm,
    () => {}, // 空的搜索回调，因为我们在useMemo中处理搜索
    300,
    0
  )

  // 筛选实验数据（使用useMemo优化）
  const filteredExperiments = useMemo(() => {
    if (!experiments) return []
    
    let filtered = experiments

    // 搜索筛选
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        exp =>
          exp.experimentNo.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          exp.sampleName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          exp.operator.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          exp.method.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(exp => exp.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(exp => exp.experimentType === typeFilter)
    }

    // 优先级筛选
    if (priorityFilter) {
      filtered = filtered.filter(exp => exp.priority === priorityFilter)
    }

    return filtered
  }, [experiments, debouncedSearchTerm, statusFilter, typeFilter, priorityFilter])
  
  // 统计数据（使用缓存优化）
  const stats = useMemo(() => {
    if (!experiments) return { total: 0, pending: 0, running: 0, completed: 0, failed: 0 }
    
    return {
      total: experiments.length,
      pending: experiments.filter(exp => exp.status === 'pending').length,
      running: experiments.filter(exp => exp.status === 'running').length,
      completed: experiments.filter(exp => exp.status === 'completed').length,
      failed: experiments.filter(exp => exp.status === 'failed').length,
    }
  }, [experiments])

  /**
   * 处理删除实验（使用useCallback优化）
   * @param id 实验ID
   */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定要删除这个质谱实验吗？')) {
      return
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      // 使用局部更新优化
      updateData(prev => prev.filter(exp => exp.id !== id))
      toast.success('删除成功')
    } catch (error) {
      toast.error('删除失败')
    }
  }, [updateData])

  /**
   * 处理导出数据
   * @param id 实验ID
   */
  const handleExport = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('数据导出成功')
    } catch (error) {
      toast.error('数据导出失败')
    }
  }

  // 获取状态标签样式
  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option
      ? { label: option.label, color: option.color }
      : { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  // 获取优先级标签样式
  const getPriorityLabel = (priority: string) => {
    const option = priorityOptions.find(opt => opt.value === priority)
    return option
      ? { label: option.label, color: option.color }
      : { label: priority, color: 'bg-gray-100 text-gray-800' }
  }

  // 获取实验类型标签
  const getTypeLabel = (type: string) => {
    const option = typeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  // 表格列配置
  const columns = [
    {
      key: 'experimentNo',
      title: '实验编号',
      width: 120,
      render: (value: string, record: MassSpecExperiment) => (
        <Link
          to={`/mass-spec/${record.id}`}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'sampleInfo',
      title: '样本信息',
      width: 200,
      render: (_: any, record: MassSpecExperiment) => (
        <div>
          <div className='font-medium'>{record.sampleName}</div>
          <div className='text-sm text-gray-500'>{record.sampleId}</div>
        </div>
      ),
    },
    {
      key: 'experimentType',
      title: '实验类型',
      width: 100,
      render: (value: string) => (
        <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium'>
          {getTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'method',
      title: '分析方法',
      width: 150,
    },
    {
      key: 'operator',
      title: '操作员',
      width: 80,
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      render: (value: string) => {
        const { label, color } = getStatusLabel(value)
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
          >
            {label}
          </span>
        )
      },
    },
    {
      key: 'priority',
      title: '优先级',
      width: 80,
      render: (value: string) => {
        const { label, color } = getPriorityLabel(value)
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
          >
            {label}
          </span>
        )
      },
    },
    {
      key: 'instrument',
      title: '仪器设备',
      width: 120,
    },
    {
      key: 'startTime',
      title: '开始时间',
      width: 150,
      render: (value: string) => {
        try {
          return new Date(value).toLocaleString('zh-CN')
        } catch {
          return value || '-'
        }
      },
    },
    {
      key: 'duration',
      title: '耗时(分钟)',
      width: 100,
      render: (value: number) => (value ? `${value}分钟` : '-'),
    },
    {
      key: 'dataSize',
      title: '数据大小(GB)',
      width: 120,
      render: (value: number) => (value ? `${value.toFixed(1)}GB` : '-'),
    },
    {
      key: 'actions',
      title: '操作',
      width: 150,
      render: (_: any, record: MassSpecExperiment) => (
        <div className='flex space-x-2'>
          <Link
            to={`/mass-spec/${record.id}`}
            className='text-blue-600 hover:text-blue-800'
            title='查看详情'
          >
            <Eye className='w-4 h-4' />
          </Link>
          <Link
            to={`/mass-spec/${record.id}/edit`}
            className='text-green-600 hover:text-green-800'
            title='编辑'
          >
            <Edit className='w-4 h-4' />
          </Link>
          <button
            onClick={() => handleExport(record.id)}
            className='text-purple-600 hover:text-purple-800'
            title='导出数据'
          >
            <Download className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className='text-red-600 hover:text-red-800'
            title='删除'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ]

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
      <div className='p-6'>
      {/* 页面标题 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>质谱实验列表</h1>
        <p className='text-gray-600 mt-1'>管理和查看所有质谱实验</p>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <SkeletonLoader type="cards" count={5} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
            <div className='text-sm text-gray-600'>总实验数</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending}
            </div>
            <div className='text-sm text-gray-600'>待开始</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.running}
            </div>
            <div className='text-sm text-gray-600'>进行中</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.completed}
            </div>
            <div className='text-sm text-gray-600'>已完成</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-red-600'>{stats.failed}</div>
            <div className='text-sm text-gray-600'>失败</div>
          </div>
        </div>
      )}

      {/* 操作栏 */}
      <div className='bg-white p-4 rounded-lg shadow mb-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          {/* 搜索框 */}
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='搜索实验编号、样本名称、操作员或方法...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* 筛选器 */}
          <div className='flex flex-wrap items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>全部状态</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>全部类型</option>
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>全部优先级</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Link
              to='/mass-spec/create'
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2'
            >
              <Plus className='w-4 h-4' />
              <span>新建实验</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className='bg-white rounded-lg shadow'>
        <DataTable
          columns={columns}
          dataSource={filteredExperiments}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </div>
      </div>
    </ErrorBoundary>
  )
}

// 使用memo优化组件
export default memo(MassSpecList)
