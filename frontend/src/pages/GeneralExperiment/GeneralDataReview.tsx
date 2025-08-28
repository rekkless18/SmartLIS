/**
 * 数据审核页面
 * 支持数据审核、批准和驳回
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 审核状态
type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'reviewing'

// 审核数据接口
interface ReviewData {
  id: string
  experimentId: string
  experimentCode: string
  experimentName: string
  sampleCode: string
  sampleName: string
  dataCount: number
  submittedBy: string
  submittedAt: string
  reviewStatus: ReviewStatus
  reviewer?: string
  reviewedAt?: string
  reviewComments?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt: string
}

// 实验数据详情接口
interface ExperimentDataDetail {
  id: string
  parameterName: string
  parameterCode: string
  measuredValue: number | string
  unit: string
  standardValue?: number
  result: 'pass' | 'fail' | 'pending'
  method: string
  equipment: string
  operator: string
  measureTime: string
  remarks?: string
}

// 审核状态选项
const reviewStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '审核中', value: 'reviewing' },
  { label: '已批准', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

// 优先级选项
const priorityOptions = [
  { label: '全部优先级', value: '' },
  { label: '紧急', value: 'urgent' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

const DataReview: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [reviewList, setReviewList] = useState<ReviewData[]>([])
  const [filteredReviewList, setFilteredReviewList] = useState<ReviewData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null)
  const [reviewDetails, setReviewDetails] = useState<ExperimentDataDetail[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(
    null
  )
  const [reviewComments, setReviewComments] = useState('')
  const [processing, setProcessing] = useState(false)

  // 模拟审核数据
  const mockReviewList: ReviewData[] = [
    {
      id: '1',
      experimentId: 'exp1',
      experimentCode: 'EXP2025010001',
      experimentName: '工业废水COD检测',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      dataCount: 5,
      submittedBy: '张三',
      submittedAt: '2025-01-21T16:30:00Z',
      reviewStatus: 'pending',
      priority: 'high',
      createdAt: '2025-01-21T16:30:00Z',
      updatedAt: '2025-01-21T16:30:00Z',
    },
    {
      id: '2',
      experimentId: 'exp2',
      experimentCode: 'EXP2025010002',
      experimentName: '土壤重金属分析',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      dataCount: 8,
      submittedBy: '李四',
      submittedAt: '2025-01-20T14:20:00Z',
      reviewStatus: 'reviewing',
      reviewer: '王审核',
      priority: 'medium',
      createdAt: '2025-01-20T14:20:00Z',
      updatedAt: '2025-01-21T10:15:00Z',
    },
    {
      id: '3',
      experimentId: 'exp3',
      experimentCode: 'EXP2025010003',
      experimentName: '室内空气甲醛检测',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      dataCount: 3,
      submittedBy: '王五',
      submittedAt: '2025-01-19T11:45:00Z',
      reviewStatus: 'approved',
      reviewer: '赵审核',
      reviewedAt: '2025-01-19T15:30:00Z',
      reviewComments: '数据准确，符合标准要求',
      priority: 'urgent',
      createdAt: '2025-01-19T11:45:00Z',
      updatedAt: '2025-01-19T15:30:00Z',
    },
    {
      id: '4',
      experimentId: 'exp4',
      experimentCode: 'EXP2025010004',
      experimentName: '食品添加剂检测',
      sampleCode: 'S2025010004',
      sampleName: '食品添加剂样本',
      dataCount: 6,
      submittedBy: '赵六',
      submittedAt: '2025-01-18T09:20:00Z',
      reviewStatus: 'rejected',
      reviewer: '孙审核',
      reviewedAt: '2025-01-18T17:10:00Z',
      reviewComments: '部分数据异常，需要重新检测',
      priority: 'low',
      createdAt: '2025-01-18T09:20:00Z',
      updatedAt: '2025-01-18T17:10:00Z',
    },
  ]

  // 模拟实验数据详情
  const mockReviewDetails: ExperimentDataDetail[] = [
    {
      id: '1',
      parameterName: 'pH值',
      parameterCode: 'ph',
      measuredValue: 7.2,
      unit: '',
      standardValue: 7.0,
      result: 'pass',
      method: 'GB/T 6920-1986',
      equipment: 'pH计-PHS-3C',
      operator: '张三',
      measureTime: '2025-01-21T10:30:00',
      remarks: '测量环境温度25℃',
    },
    {
      id: '2',
      parameterName: '化学需氧量(COD)',
      parameterCode: 'cod',
      measuredValue: 45.6,
      unit: 'mg/L',
      standardValue: 50,
      result: 'pass',
      method: 'HJ 828-2017',
      equipment: 'COD消解仪-XJ-Ⅱ',
      operator: '张三',
      measureTime: '2025-01-21T14:15:00',
      remarks: '消解时间2小时',
    },
  ]

  // 加载审核数据
  useEffect(() => {
    const loadReviewData = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        setReviewList(mockReviewList)
        setFilteredReviewList(mockReviewList)
      } catch (error) {
        console.error('加载审核数据失败:', error)
        toast.error('加载审核数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadReviewData()
  }, [])

  // 筛选和搜索
  useEffect(() => {
    let filtered = reviewList

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.experimentCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.experimentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(item => item.reviewStatus === statusFilter)
    }

    // 优先级筛选
    if (priorityFilter) {
      filtered = filtered.filter(item => item.priority === priorityFilter)
    }

    // 日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(item => item.submittedAt >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => item.submittedAt <= dateRange.end)
    }

    setFilteredReviewList(filtered)
  }, [reviewList, searchTerm, statusFilter, priorityFilter, dateRange])

  // 状态标签样式
  const getStatusBadge = (status: ReviewStatus) => {
    const statusConfig = {
      pending: {
        label: '待审核',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      reviewing: {
        label: '审核中',
        className: 'bg-blue-100 text-blue-800',
        icon: Eye,
      },
      approved: {
        label: '已批准',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        label: '已驳回',
        className: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }

    const config = statusConfig[status] || statusConfig.pending
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

  // 优先级标签样式
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: {
        label: '紧急',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      high: {
        label: '高',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      medium: {
        label: '中',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      low: {
        label: '低',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
    }

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  // 表格列配置
  const columns = [
    {
      key: 'experimentInfo',
      title: '实验信息',
      dataIndex: 'experimentCode',
      width: 200,
      render: (value: string, record: ReviewData) => (
        <div>
          <div className='font-medium text-blue-600'>{value || ''}</div>
          <div className='text-sm text-gray-900 mt-1'>
            {record?.experimentName || ''}
          </div>
          <div className='text-xs text-gray-500 mt-1'>
            {record?.sampleCode || ''} - {record?.sampleName || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'dataCount',
      title: '数据量',
      dataIndex: 'dataCount',
      width: 80,
      render: (value: number) => (
        <div className='text-center'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {value || 0} 条
          </span>
        </div>
      ),
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
      title: '审核状态',
      dataIndex: 'reviewStatus',
      width: 100,
      render: (value: ReviewStatus) => getStatusBadge(value),
    },
    {
      key: 'submittedInfo',
      title: '提交信息',
      dataIndex: 'submittedBy',
      width: 140,
      render: (value: string, record: ReviewData) => (
        <div className='text-sm'>
          <div className='font-medium'>{value || ''}</div>
          <div className='text-gray-500'>
            {record?.submittedAt
              ? new Date(record.submittedAt).toLocaleString('zh-CN')
              : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'reviewInfo',
      title: '审核信息',
      dataIndex: 'reviewer',
      width: 140,
      render: (value: string, record: ReviewData) => (
        <div className='text-sm'>
          {value ? (
            <>
              <div className='font-medium'>{value}</div>
              {record?.reviewedAt && (
                <div className='text-gray-500'>
                  {new Date(record.reviewedAt).toLocaleString('zh-CN')}
                </div>
              )}
            </>
          ) : (
            <span className='text-gray-400'>未分配</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 150,
      render: (value: any, record: ReviewData) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleViewDetails(record)}
            className='p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
            title='查看详情'
          >
            <Eye className='w-4 h-4' />
          </button>
          {record?.reviewStatus === 'pending' && (
            <>
              <button
                onClick={() => handleReviewAction(record, 'approve')}
                className='p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors'
                title='批准'
              >
                <CheckCircle className='w-4 h-4' />
              </button>
              <button
                onClick={() => handleReviewAction(record, 'reject')}
                className='p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors'
                title='驳回'
              >
                <XCircle className='w-4 h-4' />
              </button>
            </>
          )}
          {record?.reviewComments && (
            <button
              onClick={() => handleViewComments(record)}
              className='p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors'
              title='查看评论'
            >
              <MessageSquare className='w-4 h-4' />
            </button>
          )}
        </div>
      ),
    },
  ]

  // 查看详情
  const handleViewDetails = async (record: ReviewData) => {
    setSelectedReview(record)
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviewDetails(mockReviewDetails)
    } catch (error) {
      console.error('加载详情失败:', error)
      toast.error('加载详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 审核操作
  const handleReviewAction = (
    record: ReviewData,
    action: 'approve' | 'reject'
  ) => {
    setSelectedReview(record)
    setReviewAction(action)
    setReviewComments('')
    setShowReviewModal(true)
  }

  // 查看评论
  const handleViewComments = (record: ReviewData) => {
    toast.info(`审核意见：${record.reviewComments}`)
  }

  // 提交审核
  const handleSubmitReview = async () => {
    if (!selectedReview || !reviewAction) return

    setProcessing(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedReview: ReviewData = {
        ...selectedReview,
        reviewStatus: reviewAction === 'approve' ? 'approved' : 'rejected',
        reviewer: '当前用户', // 实际应用中从用户状态获取
        reviewedAt: new Date().toISOString(),
        reviewComments: reviewComments,
        updatedAt: new Date().toISOString(),
      }

      setReviewList(
        reviewList.map(item =>
          item.id === selectedReview.id ? updatedReview : item
        )
      )

      toast.success(`审核${reviewAction === 'approve' ? '批准' : '驳回'}成功`)
      setShowReviewModal(false)
      setSelectedReview(null)
      setReviewAction(null)
      setReviewComments('')
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('审核失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  // 清除筛选
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
    setDateRange({ start: '', end: '' })
  }

  // 统计数据
  const stats = {
    total: reviewList.length,
    pending: reviewList.filter(item => item.reviewStatus === 'pending').length,
    reviewing: reviewList.filter(item => item.reviewStatus === 'reviewing')
      .length,
    approved: reviewList.filter(item => item.reviewStatus === 'approved')
      .length,
    rejected: reviewList.filter(item => item.reviewStatus === 'rejected')
      .length,
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题 */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>数据审核管理</h1>
          <p className='text-gray-600 mt-1'>审核和管理实验数据</p>
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
              <p className='text-sm font-medium text-gray-500'>总数据</p>
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
              <p className='text-sm font-medium text-gray-500'>待审核</p>
              <p className='text-2xl font-semibold text-yellow-600'>
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Eye className='h-8 w-8 text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>审核中</p>
              <p className='text-2xl font-semibold text-blue-600'>
                {stats.reviewing}
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
              <p className='text-sm font-medium text-gray-500'>已批准</p>
              <p className='text-2xl font-semibold text-green-600'>
                {stats.approved}
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
              <p className='text-sm font-medium text-gray-500'>已驳回</p>
              <p className='text-2xl font-semibold text-red-600'>
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          {/* 搜索框 */}
          <div className='lg:col-span-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='搜索实验编号、名称、样本编号或提交人...'
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
              {reviewStatusOptions.map(option => (
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
              提交开始日期
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
              提交结束日期
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

      {/* 审核列表 */}
      <div className='bg-white rounded-lg shadow'>
        <DataTable
          dataSource={filteredReviewList}
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

      {/* 审核模态框 */}
      {showReviewModal && selectedReview && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                {reviewAction === 'approve' ? '批准审核' : '驳回审核'}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-2'>
                实验：{selectedReview.experimentName}
              </p>
              <p className='text-sm text-gray-600'>
                样本：{selectedReview.sampleName} ({selectedReview.sampleCode})
              </p>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                审核意见{' '}
                {reviewAction === 'reject' && (
                  <span className='text-red-500'>*</span>
                )}
              </label>
              <textarea
                value={reviewComments}
                onChange={e => setReviewComments(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? '请输入批准意见（可选）'
                    : '请输入驳回原因'
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                rows={4}
              />
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowReviewModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
              >
                取消
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={
                  processing ||
                  (reviewAction === 'reject' && !reviewComments.trim())
                }
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                }`}
              >
                {processing
                  ? '处理中...'
                  : reviewAction === 'approve'
                    ? '批准'
                    : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedReview && reviewDetails.length > 0 && !showReviewModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                实验数据详情 - {selectedReview.experimentName}
              </h3>
              <button
                onClick={() => {
                  setSelectedReview(null)
                  setReviewDetails([])
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            </div>

            <div className='space-y-4'>
              {reviewDetails.map((detail, index) => (
                <div
                  key={detail.id}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        检测参数
                      </label>
                      <p className='text-sm text-gray-900'>
                        {detail.parameterName}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        测量值
                      </label>
                      <p className='text-sm text-gray-900'>
                        {detail.measuredValue} {detail.unit}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        结果
                      </label>
                      <p className='text-sm'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            detail.result === 'pass'
                              ? 'bg-green-100 text-green-800'
                              : detail.result === 'fail'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {detail.result === 'pass'
                            ? '合格'
                            : detail.result === 'fail'
                              ? '不合格'
                              : '待定'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        检测方法
                      </label>
                      <p className='text-sm text-gray-900'>{detail.method}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        使用设备
                      </label>
                      <p className='text-sm text-gray-900'>
                        {detail.equipment}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        操作员
                      </label>
                      <p className='text-sm text-gray-900'>{detail.operator}</p>
                    </div>
                  </div>
                  {detail.remarks && (
                    <div className='mt-3'>
                      <label className='text-sm font-medium text-gray-500'>
                        备注
                      </label>
                      <p className='text-sm text-gray-900'>{detail.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataReview
