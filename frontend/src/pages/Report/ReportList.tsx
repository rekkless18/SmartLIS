/**
 * 报告列表页面
 * 展示所有检测报告，支持搜索、筛选、排序和分页
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
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
import { Badge, StatusBadge, PriorityBadge } from '../../components/ui/badge'
import {
  FileText,
  Eye,
  Edit,
  Download,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 报告数据接口
interface ReportData {
  id: string
  reportNumber: string
  sampleNumber: string
  clientName: string
  testItems: string[]
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  createdBy: string
  reviewer?: string
  dueDate: string
  reportType: string
}

/**
 * 获取状态徽章
 * @param status 状态
 * @returns JSX元素
 */
const getStatusBadge = (status: string) => {
  return <StatusBadge status={status} />
}

/**
 * 获取优先级徽章
 * @param priority 优先级
 * @returns JSX元素
 */
const getPriorityBadge = (priority: string) => {
  return <PriorityBadge priority={priority} />
}

/**
 * 模拟API调用获取报告数据
 * @returns 报告数据
 */
const fetchReports = async (): Promise<ReportData[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: '1',
      reportNumber: 'RPT-2025-001',
      sampleNumber: 'SMP-2025-001',
      clientName: '华为技术有限公司',
      testItems: ['重金属检测', '有机物分析'],
      status: 'approved',
      priority: 'high',
      createdAt: '2025-01-20 09:00:00',
      updatedAt: '2025-01-22 14:30:00',
      createdBy: '张三',
      reviewer: '李四',
      dueDate: '2025-01-25',
      reportType: '检测报告',
    },
    {
      id: '2',
      reportNumber: 'RPT-2025-002',
      sampleNumber: 'SMP-2025-002',
      clientName: '腾讯科技有限公司',
      testItems: ['微生物检测'],
      status: 'pending_review',
      priority: 'normal',
      createdAt: '2025-01-21 10:30:00',
      updatedAt: '2025-01-21 10:30:00',
      createdBy: '王五',
      dueDate: '2025-01-28',
      reportType: '检测报告',
    },
    {
      id: '3',
      reportNumber: 'RPT-2025-003',
      sampleNumber: 'SMP-2025-003',
      clientName: '阿里巴巴集团',
      testItems: ['化学成分分析', '物理性能测试'],
      status: 'draft',
      priority: 'urgent',
      createdAt: '2025-01-22 15:45:00',
      updatedAt: '2025-01-22 16:20:00',
      createdBy: '赵六',
      dueDate: '2025-01-24',
      reportType: '检测报告',
    },
  ]
}

const ReportList: React.FC = () => {
  // 使用数据缓存Hook
  const {
    data: reports = [],
    loading,
    error,
    refresh,
    updateData,
  } = useDataCache<ReportData[]>('reports', fetchReports)
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  
  // 搜索防抖
  const { debouncedSearchTerm } = useSearchDebounce(
    searchTerm,
    () => {}, // 空的搜索回调，因为我们在useMemo中处理搜索
    300,
    0
  )
  
  // 安全的报告数据（防止null/undefined错误）
  const safeReports = useMemo(() => reports || [], [reports])
  
  // 统计数据（使用缓存优化）- 添加安全检查防止null/undefined错误
  const stats = useMemo(() => {
    return {
      total: safeReports.length,
      draft: safeReports.filter(r => r.status === 'draft').length,
      pending_review: safeReports.filter(r => r.status === 'pending_review').length,
      approved: safeReports.filter(r => r.status === 'approved').length,
      sent: safeReports.filter(r => r.status === 'sent').length,
    }
  }, [safeReports])

  /**
   * 处理查看报告（使用useCallback优化）
   * @param record 报告记录
   */
  const handleView = useCallback((record: ReportData) => {
    toast.info(`查看报告: ${record.reportNumber}`)
  }, [])

  /**
   * 处理编辑报告（使用useCallback优化）
   * @param record 报告记录
   */
  const handleEdit = useCallback((record: ReportData) => {
    toast.info(`编辑报告: ${record.reportNumber}`)
  }, [])

  /**
   * 处理下载报告（使用useCallback优化）
   * @param record 报告记录
   */
  const handleDownload = useCallback((record: ReportData) => {
    toast.success(`下载报告: ${record.reportNumber}`)
  }, [])

  /**
   * 处理发送报告（使用useCallback优化）
   * @param record 报告记录
   */
  const handleSend = useCallback((record: ReportData) => {
    toast.success(`发送报告: ${record.reportNumber}`)
  }, [])

  // 表格列配置
  const columns: TableColumn<ReportData>[] = [
    {
      key: 'reportNumber',
      title: '报告编号',
      dataIndex: 'reportNumber',
      width: 150,
      render: (value: string, record: ReportData) => (
        <Link
          to={`/report/detail/${record.id}`}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {value}
        </Link>
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
      key: 'createdBy',
      title: '创建人',
      dataIndex: 'createdBy',
      width: 100,
    },
    {
      key: 'dueDate',
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 120,
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 200,
      render: (value: any, record: ReportData) => (
        <div className='flex space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleView(record)}
            className='h-8 px-2'
          >
            <Eye className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleEdit(record)}
            className='h-8 px-2'
          >
            <Edit className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleDownload(record)}
            className='h-8 px-2'
          >
            <Download className='h-3 w-3' />
          </Button>
          {record.status === 'approved' && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleSend(record)}
              className='h-8 px-2'
            >
              <Send className='h-3 w-3' />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // 表格操作配置
  const actions: TableAction[] = [
    {
      key: 'create',
      label: '新建报告',
      type: 'primary',
      icon: <Plus className='h-4 w-4' />,
      onClick: () => {
        toast.info('跳转到新建报告页面')
      },
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
      <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>报告管理</h1>
        <p className='text-gray-600 mt-1'>
          管理检测报告，支持查看、编辑、审核和发送
        </p>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <SkeletonLoader type="cards" count={5} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
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
              <CardTitle className='text-sm font-medium'>草稿</CardTitle>
              <Clock className='h-4 w-4 text-gray-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-gray-600'>
                {stats.draft}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>待审核</CardTitle>
              <AlertCircle className='h-4 w-4 text-yellow-500' />
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
              <CardTitle className='text-sm font-medium'>已发送</CardTitle>
              <Send className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>{stats.sent}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 报告列表 */}
      <Card>
        <CardContent className='p-0'>
          <DataTable
            columns={columns}
            dataSource={safeReports}
            loading={loading}
            actions={actions}
            searchable
            searchPlaceholder='搜索报告编号、样本编号或客户名称...'
            pagination={{
              current: 1,
              pageSize: 10,
              total: safeReports.length,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            onSearch={value => {
              console.log('搜索:', value)
            }}
          />
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  )
}

// 使用memo优化组件
export default memo(ReportList)
