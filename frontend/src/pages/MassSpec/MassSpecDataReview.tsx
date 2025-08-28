/**
 * 质谱数据审核页面
 * 支持质谱数据审核、批准和驳回
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 审核状态选项
const reviewStatusOptions = [
  { value: 'pending', label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: '已通过', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: '已驳回', color: 'bg-red-100 text-red-800' },
  {
    value: 'revision',
    label: '需修改',
    color: 'bg-orange-100 text-orange-800',
  },
]

// 数据类型选项
const dataTypeOptions = [
  { value: 'peak', label: '峰数据' },
  { value: 'compound', label: '化合物鉴定' },
  { value: 'quantitative', label: '定量分析' },
  { value: 'qualitative', label: '定性分析' },
]

// 质谱数据审核接口
interface MassSpecDataReview {
  id: string
  experimentId: string
  experimentNo: string
  sampleName: string
  dataType: string
  submitter: string
  submitTime: string
  reviewer?: string
  reviewTime?: string
  status: string
  dataCount: number
  comments?: string
  priority: string
  createdAt: string
  updatedAt: string
}

// 模拟质谱数据审核数据
const mockReviewData: MassSpecDataReview[] = [
  {
    id: '1',
    experimentId: 'MS-2025-001',
    experimentNo: 'MS-2025-001',
    sampleName: '血清样本A',
    dataType: 'peak',
    submitter: '张三',
    submitTime: '2025-01-20 16:30:00',
    reviewer: '李四',
    reviewTime: '2025-01-21 09:15:00',
    status: 'approved',
    dataCount: 156,
    comments: '数据质量良好，峰识别准确',
    priority: 'high',
    createdAt: '2025-01-20 16:30:00',
    updatedAt: '2025-01-21 09:15:00',
  },
  {
    id: '2',
    experimentId: 'MS-2025-002',
    experimentNo: 'MS-2025-002',
    sampleName: '尿液样本B',
    dataType: 'compound',
    submitter: '王五',
    submitTime: '2025-01-21 14:20:00',
    status: 'pending',
    dataCount: 89,
    priority: 'normal',
    createdAt: '2025-01-21 14:20:00',
    updatedAt: '2025-01-21 14:20:00',
  },
  {
    id: '3',
    experimentId: 'MS-2025-003',
    experimentNo: 'MS-2025-003',
    sampleName: '组织样本C',
    dataType: 'quantitative',
    submitter: '赵六',
    submitTime: '2025-01-21 11:45:00',
    reviewer: '李四',
    reviewTime: '2025-01-21 15:30:00',
    status: 'rejected',
    dataCount: 234,
    comments: '部分峰识别存在问题，需要重新处理数据',
    priority: 'urgent',
    createdAt: '2025-01-21 11:45:00',
    updatedAt: '2025-01-21 15:30:00',
  },
]

/**
 * 质谱数据审核页面组件
 * @returns 质谱数据审核页面
 */
const MassSpecDataReview: React.FC = () => {
  const [reviewData, setReviewData] = useState<MassSpecDataReview[]>([])
  const [filteredData, setFilteredData] = useState<MassSpecDataReview[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [currentReviewId, setCurrentReviewId] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  /**
   * 加载审核数据
   */
  const loadReviewData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReviewData(mockReviewData)
      setFilteredData(mockReviewData)
    } catch (error) {
      toast.error('加载审核数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 筛选数据
   */
  const filterData = () => {
    let filtered = reviewData

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.experimentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sampleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.submitter.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(item => item.dataType === typeFilter)
    }

    setFilteredData(filtered)
  }

  /**
   * 处理审核操作
   * @param id 数据ID
   * @param action 审核动作
   * @param comment 审核意见
   */
  const handleReview = async (
    id: string,
    action: 'approve' | 'reject' | 'revision',
    comment?: string
  ) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        revision: 'revision',
      }

      setReviewData(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status: statusMap[action],
                reviewer: '当前用户',
                reviewTime: new Date().toLocaleString('zh-CN'),
                comments: comment || item.comments,
                updatedAt: new Date().toLocaleString('zh-CN'),
              }
            : item
        )
      )

      const actionText = {
        approve: '通过',
        reject: '驳回',
        revision: '要求修改',
      }

      toast.success(`审核${actionText[action]}成功`)
    } catch (error) {
      toast.error('审核操作失败')
    }
  }

  /**
   * 批量审核
   * @param action 审核动作
   */
  const handleBatchReview = async (action: 'approve' | 'reject') => {
    if (selectedItems.length === 0) {
      toast.error('请选择要审核的数据')
      return
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
      }

      setReviewData(prev =>
        prev.map(item =>
          selectedItems.includes(item.id)
            ? {
                ...item,
                status: statusMap[action],
                reviewer: '当前用户',
                reviewTime: new Date().toLocaleString('zh-CN'),
                updatedAt: new Date().toLocaleString('zh-CN'),
              }
            : item
        )
      )

      setSelectedItems([])
      const actionText = action === 'approve' ? '批准' : '驳回'
      toast.success(`批量${actionText}成功`)
    } catch (error) {
      toast.error('批量审核失败')
    }
  }

  /**
   * 打开评论模态框
   * @param id 数据ID
   */
  const openCommentModal = (id: string) => {
    setCurrentReviewId(id)
    setReviewComment('')
    setShowCommentModal(true)
  }

  /**
   * 提交带评论的审核
   * @param action 审核动作
   */
  const submitReviewWithComment = (
    action: 'approve' | 'reject' | 'revision'
  ) => {
    handleReview(currentReviewId, action, reviewComment)
    setShowCommentModal(false)
    setCurrentReviewId('')
    setReviewComment('')
  }

  // 获取状态标签样式
  const getStatusLabel = (status: string) => {
    const option = reviewStatusOptions.find(opt => opt.value === status)
    return option
      ? { label: option.label, color: option.color }
      : { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  // 获取数据类型标签
  const getTypeLabel = (type: string) => {
    const option = dataTypeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  // 表格列配置
  const columns = [
    {
      key: 'selection',
      title: (
        <input
          type='checkbox'
          checked={
            selectedItems.length === filteredData.length &&
            filteredData.length > 0
          }
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(filteredData.map(item => item.id))
            } else {
              setSelectedItems([])
            }
          }}
          className='rounded border-gray-300'
        />
      ),
      width: 50,
      render: (_: any, record: MassSpecDataReview) => (
        <input
          type='checkbox'
          checked={selectedItems.includes(record.id)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(prev => [...prev, record.id])
            } else {
              setSelectedItems(prev => prev.filter(id => id !== record.id))
            }
          }}
          className='rounded border-gray-300'
        />
      ),
    },
    {
      key: 'experimentNo',
      title: '实验编号',
      width: 120,
      render: (value: string, record: MassSpecDataReview) => (
        <Link
          to={`/mass-spec/${record.id}/review`}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'sampleName',
      title: '样本名称',
      width: 150,
    },
    {
      key: 'dataType',
      title: '数据类型',
      width: 100,
      render: (value: string) => (
        <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
          {getTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'dataCount',
      title: '数据条数',
      width: 80,
      render: (value: number) => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'submitter',
      title: '提交人',
      width: 80,
    },
    {
      key: 'submitTime',
      title: '提交时间',
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
      key: 'status',
      title: '审核状态',
      width: 100,
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
      key: 'reviewer',
      title: '审核人',
      width: 80,
      render: (value: string) => value || '-',
    },
    {
      key: 'reviewTime',
      title: '审核时间',
      width: 150,
      render: (value: string) => {
        if (!value) return '-'
        try {
          return new Date(value).toLocaleString('zh-CN')
        } catch {
          return value
        }
      },
    },
    {
      key: 'comments',
      title: '审核意见',
      width: 200,
      render: (value: string) => (
        <div className='max-w-xs truncate' title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      render: (_: any, record: MassSpecDataReview) => {
        if (record.status === 'pending') {
          return (
            <div className='flex space-x-2'>
              <button
                onClick={() => handleReview(record.id, 'approve')}
                className='text-green-600 hover:text-green-800 flex items-center space-x-1'
                title='通过'
              >
                <Check className='w-4 h-4' />
                <span className='text-xs'>通过</span>
              </button>
              <button
                onClick={() => openCommentModal(record.id)}
                className='text-red-600 hover:text-red-800 flex items-center space-x-1'
                title='驳回'
              >
                <X className='w-4 h-4' />
                <span className='text-xs'>驳回</span>
              </button>
              <Link
                to={`/mass-spec/${record.id}/review`}
                className='text-blue-600 hover:text-blue-800 flex items-center space-x-1'
                title='查看详情'
              >
                <Eye className='w-4 h-4' />
                <span className='text-xs'>详情</span>
              </Link>
            </div>
          )
        } else {
          return (
            <Link
              to={`/mass-spec/${record.id}/review`}
              className='text-blue-600 hover:text-blue-800 flex items-center space-x-1'
              title='查看详情'
            >
              <Eye className='w-4 h-4' />
              <span className='text-xs'>详情</span>
            </Link>
          )
        }
      },
    },
  ]

  // 统计数据
  const stats = {
    total: reviewData.length,
    pending: reviewData.filter(item => item.status === 'pending').length,
    approved: reviewData.filter(item => item.status === 'approved').length,
    rejected: reviewData.filter(item => item.status === 'rejected').length,
    revision: reviewData.filter(item => item.status === 'revision').length,
  }

  useEffect(() => {
    loadReviewData()
  }, [])

  useEffect(() => {
    filterData()
  }, [searchTerm, statusFilter, typeFilter, reviewData])

  return (
    <div className='p-6'>
      {/* 页面标题 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>质谱数据审核</h1>
        <p className='text-gray-600 mt-1'>审核质谱实验数据，确保数据质量</p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
          <div className='text-sm text-gray-600'>总数据数</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-yellow-600'>
            {stats.pending}
          </div>
          <div className='text-sm text-gray-600'>待审核</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-green-600'>
            {stats.approved}
          </div>
          <div className='text-sm text-gray-600'>已通过</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-red-600'>
            {stats.rejected}
          </div>
          <div className='text-sm text-gray-600'>已驳回</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-orange-600'>
            {stats.revision}
          </div>
          <div className='text-sm text-gray-600'>需修改</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className='bg-white p-4 rounded-lg shadow mb-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          {/* 搜索框 */}
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='搜索实验编号、样本名称或提交人...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* 筛选器和批量操作 */}
          <div className='flex flex-wrap items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>全部状态</option>
                {reviewStatusOptions.map(option => (
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
              {dataTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {selectedItems.length > 0 && (
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleBatchReview('approve')}
                  className='bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm'
                >
                  <Check className='w-4 h-4' />
                  <span>批量通过</span>
                </button>
                <button
                  onClick={() => handleBatchReview('reject')}
                  className='bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center space-x-1 text-sm'
                >
                  <X className='w-4 h-4' />
                  <span>批量驳回</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className='bg-white rounded-lg shadow'>
        <DataTable
          columns={columns}
          dataSource={filteredData}
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

      {/* 评论模态框 */}
      {showCommentModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              添加审核意见
            </h3>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder='请输入审核意见...'
              rows={4}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <div className='flex justify-end space-x-3 mt-4'>
              <button
                onClick={() => setShowCommentModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
              >
                取消
              </button>
              <button
                onClick={() => submitReviewWithComment('revision')}
                className='px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700'
              >
                要求修改
              </button>
              <button
                onClick={() => submitReviewWithComment('reject')}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
              >
                驳回
              </button>
              <button
                onClick={() => submitReviewWithComment('approve')}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MassSpecDataReview
