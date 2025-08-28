/**
 * 异常处理页面
 * 处理实验异常情况
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  FileText,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 异常类型
type ExceptionType =
  | 'equipment_failure'
  | 'data_anomaly'
  | 'sample_issue'
  | 'method_error'
  | 'environmental'
  | 'other'

// 异常状态
type ExceptionStatus = 'open' | 'investigating' | 'resolved' | 'closed'

// 异常严重程度
type Severity = 'critical' | 'high' | 'medium' | 'low'

// 异常数据接口
interface ExceptionData {
  id: string
  exceptionCode: string
  experimentId: string
  experimentCode: string
  experimentName: string
  sampleCode: string
  exceptionType: ExceptionType
  severity: Severity
  title: string
  description: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  status: ExceptionStatus
  resolution?: string
  resolvedBy?: string
  resolvedAt?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

// 异常类型选项
const exceptionTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '设备故障', value: 'equipment_failure' },
  { label: '数据异常', value: 'data_anomaly' },
  { label: '样本问题', value: 'sample_issue' },
  { label: '方法错误', value: 'method_error' },
  { label: '环境因素', value: 'environmental' },
  { label: '其他', value: 'other' },
]

// 异常状态选项
const exceptionStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: 'open' },
  { label: '调查中', value: 'investigating' },
  { label: '已解决', value: 'resolved' },
  { label: '已关闭', value: 'closed' },
]

// 严重程度选项
const severityOptions = [
  { label: '全部严重程度', value: '' },
  { label: '严重', value: 'critical' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

const ExceptionHandle: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [filteredExceptions, setFilteredExceptions] = useState<ExceptionData[]>(
    []
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedException, setSelectedException] =
    useState<ExceptionData | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [processing, setProcessing] = useState(false)

  // 模拟异常数据
  const mockExceptions: ExceptionData[] = [
    {
      id: '1',
      exceptionCode: 'EXC2025010001',
      experimentId: 'exp1',
      experimentCode: 'EXP2025010001',
      experimentName: '工业废水COD检测',
      sampleCode: 'S2025010001',
      exceptionType: 'equipment_failure',
      severity: 'high',
      title: 'COD消解仪温度异常',
      description: '消解仪在检测过程中温度超出正常范围，影响检测结果准确性',
      reportedBy: '张三',
      reportedAt: '2025-01-21T14:30:00Z',
      assignedTo: '设备维护员',
      status: 'investigating',
      createdAt: '2025-01-21T14:30:00Z',
      updatedAt: '2025-01-21T15:00:00Z',
    },
    {
      id: '2',
      exceptionCode: 'EXC2025010002',
      experimentId: 'exp2',
      experimentCode: 'EXP2025010002',
      experimentName: '土壤重金属分析',
      sampleCode: 'S2025010002',
      exceptionType: 'data_anomaly',
      severity: 'medium',
      title: '重金属检测数据异常',
      description: '铅含量检测结果远超预期值，需要重新检测确认',
      reportedBy: '李四',
      reportedAt: '2025-01-20T16:45:00Z',
      status: 'open',
      createdAt: '2025-01-20T16:45:00Z',
      updatedAt: '2025-01-20T16:45:00Z',
    },
    {
      id: '3',
      exceptionCode: 'EXC2025010003',
      experimentId: 'exp3',
      experimentCode: 'EXP2025010003',
      experimentName: '室内空气甲醛检测',
      sampleCode: 'S2025010003',
      exceptionType: 'sample_issue',
      severity: 'low',
      title: '样本容器破损',
      description: '采样容器在运输过程中出现轻微破损，但不影响检测',
      reportedBy: '王五',
      reportedAt: '2025-01-19T09:20:00Z',
      status: 'resolved',
      resolution: '更换新的采样容器，重新采样检测',
      resolvedBy: '王五',
      resolvedAt: '2025-01-19T11:30:00Z',
      createdAt: '2025-01-19T09:20:00Z',
      updatedAt: '2025-01-19T11:30:00Z',
    },
    {
      id: '4',
      exceptionCode: 'EXC2025010004',
      experimentId: 'exp4',
      experimentCode: 'EXP2025010004',
      experimentName: '食品添加剂检测',
      sampleCode: 'S2025010004',
      exceptionType: 'environmental',
      severity: 'critical',
      title: '实验室温湿度超标',
      description: '实验室空调故障导致温湿度超出标准范围，影响检测精度',
      reportedBy: '赵六',
      reportedAt: '2025-01-18T13:15:00Z',
      assignedTo: '实验室管理员',
      status: 'resolved',
      resolution: '修复空调系统，重新校准设备，重做受影响的检测',
      resolvedBy: '实验室管理员',
      resolvedAt: '2025-01-18T18:00:00Z',
      createdAt: '2025-01-18T13:15:00Z',
      updatedAt: '2025-01-18T18:00:00Z',
    },
  ]

  // 加载异常数据
  useEffect(() => {
    const loadExceptions = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        setExceptions(mockExceptions)
        setFilteredExceptions(mockExceptions)
      } catch (error) {
        console.error('加载异常数据失败:', error)
        toast.error('加载异常数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadExceptions()
  }, [])

  // 筛选和搜索
  useEffect(() => {
    let filtered = exceptions

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.exceptionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.experimentCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(item => item.exceptionType === typeFilter)
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // 严重程度筛选
    if (severityFilter) {
      filtered = filtered.filter(item => item.severity === severityFilter)
    }

    // 日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(item => item.reportedAt >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => item.reportedAt <= dateRange.end)
    }

    setFilteredExceptions(filtered)
  }, [
    exceptions,
    searchTerm,
    typeFilter,
    statusFilter,
    severityFilter,
    dateRange,
  ])

  // 异常类型标签样式
  const getTypeBadge = (type: ExceptionType) => {
    const typeConfig = {
      equipment_failure: {
        label: '设备故障',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      data_anomaly: {
        label: '数据异常',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      sample_issue: {
        label: '样本问题',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      method_error: {
        label: '方法错误',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      environmental: {
        label: '环境因素',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      other: {
        label: '其他',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
      },
    }

    const config = typeConfig[type] || typeConfig.other

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  // 严重程度标签样式
  const getSeverityBadge = (severity: Severity) => {
    const severityConfig = {
      critical: { label: '严重', className: 'bg-red-100 text-red-800' },
      high: { label: '高', className: 'bg-orange-100 text-orange-800' },
      medium: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
      low: { label: '低', className: 'bg-green-100 text-green-800' },
    }

    const config = severityConfig[severity] || severityConfig.medium

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        <AlertTriangle className='w-3 h-3 mr-1' />
        {config.label}
      </span>
    )
  }

  // 状态标签样式
  const getStatusBadge = (status: ExceptionStatus) => {
    const statusConfig = {
      open: {
        label: '待处理',
        className: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
      },
      investigating: {
        label: '调查中',
        className: 'bg-blue-100 text-blue-800',
        icon: Search,
      },
      resolved: {
        label: '已解决',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      closed: {
        label: '已关闭',
        className: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
      },
    }

    const config = statusConfig[status] || statusConfig.open
    const IconComponent = config.icon

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        <IconComponent className='w-3 h-3 mr-1' />
        {config.label}
      </span>
    )
  }

  // 表格列配置
  const columns = [
    {
      key: 'exceptionCode',
      title: '异常编号',
      dataIndex: 'exceptionCode',
      width: 130,
      render: (value: string, record: ExceptionData) => (
        <div className='font-mono text-sm'>
          <div className='font-medium text-blue-600'>{value}</div>
          <div className='text-xs text-gray-500'>{record.experimentCode}</div>
        </div>
      ),
    },
    {
      key: 'title',
      title: '异常标题',
      dataIndex: 'title',
      width: 200,
      render: (value: string, record: ExceptionData) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500 mt-1'>
            {record.experimentName}
          </div>
          <div className='text-xs text-gray-400 mt-1'>{record.sampleCode}</div>
        </div>
      ),
    },
    {
      key: 'type',
      title: '异常类型',
      dataIndex: 'exceptionType',
      width: 100,
      render: (value: ExceptionType) => getTypeBadge(value),
    },
    {
      key: 'severity',
      title: '严重程度',
      dataIndex: 'severity',
      width: 100,
      render: (value: Severity) => getSeverityBadge(value),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: ExceptionStatus) => getStatusBadge(value),
    },
    {
      key: 'reportedInfo',
      title: '报告信息',
      dataIndex: 'reportedBy',
      width: 140,
      render: (value: string, record: ExceptionData) => (
        <div className='text-sm'>
          <div className='font-medium'>{value}</div>
          <div className='text-gray-500'>
            {new Date(record.reportedAt).toLocaleString('zh-CN')}
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      title: '负责人',
      dataIndex: 'assignedTo',
      width: 100,
      render: (value: string) => (
        <span className='text-sm font-medium'>
          {value || <span className='text-gray-400'>未分配</span>}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 120,
      render: (value: any, record: ExceptionData) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleViewDetails(record)}
            className='p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
            title='查看详情'
          >
            <Eye className='w-4 h-4' />
          </button>
          {(record?.status === 'open' || record?.status === 'investigating') && (
            <button
              onClick={() => handleResolve(record)}
              className='p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors'
              title='解决异常'
            >
              <CheckCircle className='w-4 h-4' />
            </button>
          )}
          {record?.resolution && (
            <button
              onClick={() => handleViewResolution(record)}
              className='p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors'
              title='查看解决方案'
            >
              <MessageSquare className='w-4 h-4' />
            </button>
          )}
        </div>
      ),
    },
  ]

  // 新建异常表单配置
  const createExceptionFields = [
    {
      name: 'experimentCode',
      label: '实验编号',
      type: 'text' as const,
      required: true,
      placeholder: '请输入实验编号',
    },
    {
      name: 'exceptionType',
      label: '异常类型',
      type: 'select' as const,
      required: true,
      options: exceptionTypeOptions.filter(opt => opt.value !== ''),
    },
    {
      name: 'severity',
      label: '严重程度',
      type: 'select' as const,
      required: true,
      options: severityOptions.filter(opt => opt.value !== ''),
    },
    {
      name: 'title',
      label: '异常标题',
      type: 'text' as const,
      required: true,
      placeholder: '请输入异常标题',
    },
    {
      name: 'description',
      label: '异常描述',
      type: 'textarea' as const,
      required: true,
      placeholder: '请详细描述异常情况',
    },
    {
      name: 'assignedTo',
      label: '指派给',
      type: 'text' as const,
      placeholder: '请输入负责人姓名（可选）',
    },
  ]

  // 查看详情
  const handleViewDetails = (record: ExceptionData) => {
    setSelectedException(record)
  }

  // 解决异常
  const handleResolve = (record: ExceptionData) => {
    setSelectedException(record)
    setResolution('')
    setShowResolveModal(true)
  }

  // 查看解决方案
  const handleViewResolution = (record: ExceptionData) => {
    toast.info(`解决方案：${record.resolution}`)
  }

  // 提交新异常
  const handleCreateException = async (formData: any) => {
    setProcessing(true)
    try {
      const newException: ExceptionData = {
        id: Date.now().toString(),
        exceptionCode: `EXC${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(exceptions.length + 1).padStart(3, '0')}`,
        experimentId: 'exp_' + Date.now(),
        experimentCode: formData.experimentCode,
        experimentName: '实验名称', // 实际应用中应该根据实验编号获取
        sampleCode: 'S' + formData.experimentCode.slice(-8),
        exceptionType: formData.exceptionType,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        reportedBy: '当前用户', // 实际应用中从用户状态获取
        reportedAt: new Date().toISOString(),
        assignedTo: formData.assignedTo || undefined,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      setExceptions([newException, ...exceptions])
      toast.success('异常报告创建成功')
      setShowCreateModal(false)
    } catch (error) {
      console.error('创建异常失败:', error)
      toast.error('创建异常失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  // 提交解决方案
  const handleSubmitResolution = async () => {
    if (!selectedException || !resolution.trim()) return

    setProcessing(true)
    try {
      const updatedException: ExceptionData = {
        ...selectedException,
        status: 'resolved',
        resolution: resolution,
        resolvedBy: '当前用户', // 实际应用中从用户状态获取
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      setExceptions(
        exceptions.map(item =>
          item.id === selectedException.id ? updatedException : item
        )
      )

      toast.success('异常解决成功')
      setShowResolveModal(false)
      setSelectedException(null)
      setResolution('')
    } catch (error) {
      console.error('解决异常失败:', error)
      toast.error('解决异常失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  // 清除筛选
  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setStatusFilter('')
    setSeverityFilter('')
    setDateRange({ start: '', end: '' })
  }

  // 统计数据
  const stats = {
    total: exceptions.length,
    open: exceptions.filter(item => item.status === 'open').length,
    investigating: exceptions.filter(item => item.status === 'investigating')
      .length,
    resolved: exceptions.filter(item => item.status === 'resolved').length,
    critical: exceptions.filter(item => item.severity === 'critical').length,
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>异常处理管理</h1>
          <p className='text-gray-600 mt-1'>管理和处理实验异常情况</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors'
          >
            <Plus className='w-4 h-4 mr-2' />
            报告异常
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <FileText className='h-8 w-8 text-gray-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>总异常</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <AlertTriangle className='h-8 w-8 text-red-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>待处理</p>
              <p className='text-2xl font-semibold text-red-600'>
                {stats.open}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Search className='h-8 w-8 text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>调查中</p>
              <p className='text-2xl font-semibold text-blue-600'>
                {stats.investigating}
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
              <p className='text-sm font-medium text-gray-500'>已解决</p>
              <p className='text-2xl font-semibold text-green-600'>
                {stats.resolved}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <AlertTriangle className='h-8 w-8 text-red-500' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>严重异常</p>
              <p className='text-2xl font-semibold text-red-600'>
                {stats.critical}
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
                placeholder='搜索异常编号、标题、实验编号或报告人...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* 类型筛选 */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {exceptionTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 状态筛选 */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {exceptionStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 严重程度筛选 */}
          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {severityOptions.map(option => (
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
              报告开始日期
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
              报告结束日期
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

      {/* 异常列表 */}
      <div className='bg-white rounded-lg shadow'>
        <DataTable
          dataSource={filteredExceptions}
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

      {/* 新建异常模态框 */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>报告异常</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            </div>
            <FormBuilder
              fields={createExceptionFields}
              onSubmit={handleCreateException}
              loading={processing}
              submitText='提交异常报告'
              layout='vertical'
            />
          </div>
        </div>
      )}

      {/* 解决异常模态框 */}
      {showResolveModal && selectedException && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>解决异常</h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-2'>
                异常：{selectedException.title}
              </p>
              <p className='text-sm text-gray-600'>
                实验：{selectedException.experimentName}
              </p>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                解决方案 <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder='请详细描述解决方案和处理过程'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                rows={4}
              />
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowResolveModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
              >
                取消
              </button>
              <button
                onClick={handleSubmitResolution}
                disabled={processing || !resolution.trim()}
                className='px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 transition-colors'
              >
                {processing ? '处理中...' : '确认解决'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedException && !showResolveModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                异常详情 - {selectedException.exceptionCode}
              </h3>
              <button
                onClick={() => setSelectedException(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    异常标题
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedException.title}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    实验信息
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedException.experimentName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {selectedException.experimentCode}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    异常类型
                  </label>
                  <div className='mt-1'>
                    {getTypeBadge(selectedException.exceptionType)}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    严重程度
                  </label>
                  <div className='mt-1'>
                    {getSeverityBadge(selectedException.severity)}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    状态
                  </label>
                  <div className='mt-1'>
                    {getStatusBadge(selectedException.status)}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    报告人
                  </label>
                  <p className='text-sm text-gray-900'>
                    {selectedException.reportedBy}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {new Date(selectedException.reportedAt).toLocaleString(
                      'zh-CN'
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-500'>
                  异常描述
                </label>
                <p className='text-sm text-gray-900 mt-1'>
                  {selectedException.description}
                </p>
              </div>

              {selectedException.resolution && (
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    解决方案
                  </label>
                  <p className='text-sm text-gray-900 mt-1'>
                    {selectedException.resolution}
                  </p>
                  {selectedException.resolvedBy && (
                    <p className='text-xs text-gray-500 mt-1'>
                      解决人：{selectedException.resolvedBy} | 解决时间：
                      {selectedException.resolvedAt &&
                        new Date(selectedException.resolvedAt).toLocaleString(
                          'zh-CN'
                        )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExceptionHandle
