/**
 * 报告审核页面
 * 支持报告审核、批准和驳回功能，包含审核状态管理
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import DataTable, {
  type TableColumn,
  type TableAction,
} from '../../components/DataTable'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import Modal from '../../components/Modal'
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

// 审核报告数据接口
interface ReviewReportData {
  id: string
  reportNumber: string
  sampleNumber: string
  clientName: string
  testItems: string[]
  status: 'pending_review' | 'approved' | 'rejected'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  submittedAt: string
  submittedBy: string
  reviewer?: string
  reviewedAt?: string
  reviewComments?: string
  dueDate: string
  reportType: string
}

// 审核历史接口
interface ReviewHistory {
  id: string
  action: 'submitted' | 'approved' | 'rejected' | 'returned'
  reviewer: string
  timestamp: string
  comments: string
}

// 报告状态配置
const statusConfig = {
  pending_review: {
    label: '待审核',
    className: 'bg-yellow-100 text-yellow-800',
  },
  approved: { label: '已批准', className: 'bg-green-100 text-green-800' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
}

// 优先级配置
const priorityConfig = {
  low: { label: '低', className: 'bg-gray-100 text-gray-800' },
  normal: { label: '普通', className: 'bg-blue-100 text-blue-800' },
  high: { label: '高', className: 'bg-orange-100 text-orange-800' },
  urgent: { label: '紧急', className: 'bg-red-100 text-red-800' },
}

/**
 * 获取状态徽章
 * @param status 状态
 * @returns JSX元素
 */
const getStatusBadge = (status: string) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }
  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取优先级徽章
 * @param priority 优先级
 * @returns JSX元素
 */
const getPriorityBadge = (priority: string) => {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }
  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 模拟审核报告数据
 */
const mockReviewReports: ReviewReportData[] = [
  {
    id: '1',
    reportNumber: 'RPT-2025-002',
    sampleNumber: 'SMP-2025-002',
    clientName: '腾讯科技有限公司',
    testItems: ['微生物检测'],
    status: 'pending_review',
    priority: 'normal',
    submittedAt: '2025-01-21 10:30:00',
    submittedBy: '王五',
    dueDate: '2025-01-28',
    reportType: '检测报告',
  },
  {
    id: '2',
    reportNumber: 'RPT-2025-004',
    sampleNumber: 'SMP-2025-004',
    clientName: '百度在线网络技术有限公司',
    testItems: ['化学成分分析', '物理性能测试'],
    status: 'pending_review',
    priority: 'high',
    submittedAt: '2025-01-22 14:15:00',
    submittedBy: '赵六',
    dueDate: '2025-01-26',
    reportType: '检测报告',
  },
  {
    id: '3',
    reportNumber: 'RPT-2025-001',
    sampleNumber: 'SMP-2025-001',
    clientName: '华为技术有限公司',
    testItems: ['重金属检测', '有机物分析'],
    status: 'approved',
    priority: 'high',
    submittedAt: '2025-01-20 09:00:00',
    submittedBy: '张三',
    reviewer: '李四',
    reviewedAt: '2025-01-22 14:30:00',
    reviewComments: '报告内容完整，检测结果准确，符合审核标准。',
    dueDate: '2025-01-25',
    reportType: '检测报告',
  },
]

/**
 * 模拟审核历史数据
 */
const mockReviewHistory: ReviewHistory[] = [
  {
    id: '1',
    action: 'submitted',
    reviewer: '王五',
    timestamp: '2025-01-21 10:30:00',
    comments: '提交报告审核',
  },
  {
    id: '2',
    action: 'approved',
    reviewer: '李四',
    timestamp: '2025-01-22 14:30:00',
    comments: '报告内容完整，检测结果准确，符合审核标准。',
  },
]

const ReportReview: React.FC = () => {
  const [reports, setReports] = useState<ReviewReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
  })
  const [selectedReport, setSelectedReport] = useState<ReviewReportData | null>(
    null
  )
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>(
    'approve'
  )
  const [reviewComments, setReviewComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [reviewHistory, setReviewHistory] = useState<ReviewHistory[]>([])

  /**
   * 加载审核报告数据
   */
  const loadReports = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReports(mockReviewReports)

      // 计算统计数据
      const newStats = {
        total: mockReviewReports.length,
        pending_review: mockReviewReports.filter(
          r => r.status === 'pending_review'
        ).length,
        approved: mockReviewReports.filter(r => r.status === 'approved').length,
        rejected: mockReviewReports.filter(r => r.status === 'rejected').length,
      }
      setStats(newStats)
    } catch (error) {
      console.error('加载审核报告数据失败:', error)
      toast.error('加载审核报告数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理查看报告
   * @param record 报告记录
   */
  const handleView = (record: ReviewReportData) => {
    toast.info(`查看报告: ${record.reportNumber}`)
  }

  /**
   * 处理审核报告
   * @param record 报告记录
   * @param action 审核动作
   */
  const handleReview = (
    record: ReviewReportData,
    action: 'approve' | 'reject'
  ) => {
    setSelectedReport(record)
    setReviewAction(action)
    setReviewComments('')
    setReviewModalOpen(true)
  }

  /**
   * 提交审核结果
   */
  const handleSubmitReview = async () => {
    if (!selectedReport) return

    try {
      setSubmitting(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 更新报告状态
      const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected'
      setReports(prev =>
        prev.map(report =>
          report.id === selectedReport.id
            ? {
                ...report,
                status: newStatus,
                reviewer: '当前用户',
                reviewedAt: new Date().toLocaleString('zh-CN'),
                reviewComments,
              }
            : report
        )
      )

      // 更新统计数据
      setStats(prev => ({
        ...prev,
        pending_review: prev.pending_review - 1,
        [newStatus]: prev[newStatus as keyof typeof prev] + 1,
      }))

      toast.success(`报告${reviewAction === 'approve' ? '批准' : '驳回'}成功`)
      setReviewModalOpen(false)
    } catch (error) {
      console.error('提交审核失败:', error)
      toast.error('提交审核失败')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 查看审核历史
   * @param record 报告记录
   */
  const handleViewHistory = (record: ReviewReportData) => {
    setSelectedReport(record)
    setReviewHistory(mockReviewHistory)
    setHistoryModalOpen(true)
  }

  // 表格列配置
  const columns: TableColumn<ReviewReportData>[] = [
    {
      key: 'reportNumber',
      title: '报告编号',
      dataIndex: 'reportNumber',
      width: 150,
      render: (value: string) => (
        <span className='font-medium text-blue-600'>{value}</span>
      ),
    },
    {
      key: 'sampleNumber',
      title: '样本编号',
      dataIndex: 'sampleNumber',
      width: 150,
    },
    {
      key: 'clientName',
      title: '客户名称',
      dataIndex: 'clientName',
      width: 200,
    },
    {
      key: 'testItems',
      title: '检测项目',
      dataIndex: 'testItems',
      width: 200,
      render: (value: string[]) => (
        <div className='space-y-1'>
          {value?.slice(0, 2).map((item, index) => (
            <Badge key={index} variant='outline' className='text-xs'>
              {item}
            </Badge>
          ))}
          {value?.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{value.length - 2}项
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'priority',
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (value: string) => getPriorityBadge(value),
    },
    {
      key: 'submittedBy',
      title: '提交人',
      dataIndex: 'submittedBy',
      width: 100,
    },
    {
      key: 'submittedAt',
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 150,
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'dueDate',
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 120,
      render: (value: string) => {
        const isOverdue = new Date(value) < new Date()
        return (
          <span
            className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}
          >
            {value}
            {isOverdue && <AlertTriangle className='h-3 w-3 inline ml-1' />}
          </span>
        )
      },
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 250,
      render: (value: any, record: ReviewReportData) => (
        <div className='flex space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleView(record)}
            className='h-8 px-2'
          >
            <Eye className='h-3 w-3' />
          </Button>

          {record.status === 'pending_review' && (
            <>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleReview(record, 'approve')}
                className='h-8 px-2 text-green-600 border-green-200 hover:bg-green-50'
              >
                <CheckCircle className='h-3 w-3' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleReview(record, 'reject')}
                className='h-8 px-2 text-red-600 border-red-200 hover:bg-red-50'
              >
                <XCircle className='h-3 w-3' />
              </Button>
            </>
          )}

          <Button
            size='sm'
            variant='outline'
            onClick={() => handleViewHistory(record)}
            className='h-8 px-2'
          >
            <MessageSquare className='h-3 w-3' />
          </Button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>报告审核</h1>
        <p className='text-gray-600 mt-1'>
          审核提交的检测报告，支持批准和驳回操作
        </p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总报告数</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>待审核</CardTitle>
            <Clock className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending_review}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>已批准</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>已驳回</CardTitle>
            <XCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 报告列表 */}
      <Card>
        <CardContent className='p-0'>
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            searchable
            searchPlaceholder='搜索报告编号、样本编号或客户名称...'
            pagination={{
              current: 1,
              pageSize: 10,
              total: reports.length,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            onSearch={value => {
              console.log('搜索:', value)
            }}
          />
        </CardContent>
      </Card>

      {/* 审核模态框 */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction === 'approve' ? '批准' : '驳回'}报告`}
        size='md'
      >
        <div className='space-y-4'>
          {selectedReport && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>报告信息</h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>报告编号:</span>
                  <span className='ml-2 font-medium'>
                    {selectedReport.reportNumber}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>样本编号:</span>
                  <span className='ml-2 font-medium'>
                    {selectedReport.sampleNumber}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>客户名称:</span>
                  <span className='ml-2 font-medium'>
                    {selectedReport.clientName}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>提交人:</span>
                  <span className='ml-2 font-medium'>
                    {selectedReport.submittedBy}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              审核意见{' '}
              {reviewAction === 'reject' && (
                <span className='text-red-500'>*</span>
              )}
            </label>
            <textarea
              value={reviewComments}
              onChange={e => setReviewComments(e.target.value)}
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              placeholder={`请输入${reviewAction === 'approve' ? '批准' : '驳回'}意见...`}
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => setReviewModalOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={
                submitting ||
                (reviewAction === 'reject' && !reviewComments.trim())
              }
              className={
                reviewAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {submitting
                ? '提交中...'
                : reviewAction === 'approve'
                  ? '批准'
                  : '驳回'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 审核历史模态框 */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title='审核历史'
        size='lg'
      >
        <div className='space-y-4'>
          {selectedReport && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>报告信息</h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>报告编号:</span>
                  <span className='ml-2 font-medium'>
                    {selectedReport.reportNumber}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>当前状态:</span>
                  <span className='ml-2'>
                    {getStatusBadge(selectedReport.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className='font-medium text-gray-900 mb-3'>审核记录</h3>
            <div className='space-y-3'>
              {reviewHistory.map((history, index) => (
                <div
                  key={history.id}
                  className='flex items-start space-x-3 p-3 bg-white border rounded-lg'
                >
                  <div className='flex-shrink-0'>
                    {history.action === 'submitted' && (
                      <Clock className='h-5 w-5 text-blue-500' />
                    )}
                    {history.action === 'approved' && (
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    )}
                    {history.action === 'rejected' && (
                      <XCircle className='h-5 w-5 text-red-500' />
                    )}
                    {history.action === 'returned' && (
                      <AlertTriangle className='h-5 w-5 text-orange-500' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <User className='h-4 w-4 text-gray-400' />
                        <span className='font-medium text-gray-900'>
                          {history.reviewer}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {history.action === 'submitted'
                            ? '提交审核'
                            : history.action === 'approved'
                              ? '批准'
                              : history.action === 'rejected'
                                ? '驳回'
                                : '退回'}
                        </Badge>
                      </div>
                      <div className='flex items-center text-sm text-gray-500'>
                        <Calendar className='h-4 w-4 mr-1' />
                        {history.timestamp}
                      </div>
                    </div>
                    {history.comments && (
                      <p className='mt-2 text-sm text-gray-600'>
                        {history.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReportReview
