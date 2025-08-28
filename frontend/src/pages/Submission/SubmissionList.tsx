/**
 * 送检列表页面
 * 显示送检申请列表，支持查询、筛选等功能
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useMemo, useCallback, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Edit, FileText, Calendar } from 'lucide-react'
import DataTable, {
  TableColumn,
  TableAction,
  PaginationConfig,
} from '../../components/DataTable'
import { StatusBadge, PriorityBadge } from '../../components/ui/badge'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 送检状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待接收', value: 'pending' },
  { label: '已接收', value: 'received' },
  { label: '检测中', value: 'testing' },
  { label: '报告编制', value: 'reporting' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

// 紧急程度选项
const urgencyOptions = [
  { label: '全部', value: '' },
  { label: '普通', value: 'normal' },
  { label: '紧急', value: 'urgent' },
  { label: '特急', value: 'emergency' },
]

// 送检数据接口
interface SubmissionRecord {
  id: string
  clientName: string
  contactPerson: string
  contactPhone: string
  sampleCount: number
  sampleTypes: string[]
  testItems: string[]
  status: string
  statusText: string
  urgency: string
  urgencyText: string
  submittedAt: string
  expectedDate: string
  actualDate?: string
  progress: number
}

/**
 * 模拟API调用获取送检数据
 * @returns 送检数据
 */
const fetchSubmissions = async (): Promise<SubmissionRecord[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: 'SJ2025001',
      clientName: 'ABC环保科技有限公司',
      contactPerson: '张经理',
      contactPhone: '13800138001',
      sampleCount: 3,
      sampleTypes: ['水质样本'],
      testItems: ['重金属检测', 'pH值测定', '溶解氧测定'],
      status: 'testing',
      statusText: '检测中',
      urgency: 'urgent',
      urgencyText: '紧急',
      submittedAt: '2025-01-20 09:30:00',
      expectedDate: '2025-01-25',
      progress: 65,
    },
    {
      id: 'SJ2025002',
      clientName: 'XYZ食品检测实验室',
      contactPerson: '李主任',
      contactPhone: '13900139002',
      sampleCount: 5,
      sampleTypes: ['食品样本'],
      testItems: ['农药残留检测', '重金属检测'],
      status: 'reporting',
      statusText: '报告编制',
      urgency: 'normal',
      urgencyText: '普通',
      submittedAt: '2025-01-19 14:20:00',
      expectedDate: '2025-01-24',
      progress: 85,
    },
    {
      id: 'SJ2025003',
      clientName: '绿色农业合作社',
      contactPerson: '王总',
      contactPhone: '13700137003',
      sampleCount: 2,
      sampleTypes: ['土壤样本'],
      testItems: ['有机物检测', '重金属检测'],
      status: 'completed',
      statusText: '已完成',
      urgency: 'normal',
      urgencyText: '普通',
      submittedAt: '2025-01-18 10:15:00',
      expectedDate: '2025-01-23',
      actualDate: '2025-01-22',
      progress: 100,
    },
    {
      id: 'SJ2025004',
      clientName: '城市建设集团',
      contactPerson: '陈工程师',
      contactPhone: '13600136004',
      sampleCount: 8,
      sampleTypes: ['空气样本', '水质样本'],
      testItems: ['PM2.5检测', '重金属检测', 'pH值测定'],
      status: 'received',
      statusText: '已接收',
      urgency: 'emergency',
      urgencyText: '特急',
      submittedAt: '2025-01-21 16:45:00',
      expectedDate: '2025-01-24',
      progress: 25,
    },
    {
      id: 'SJ2025005',
      clientName: '医药研发中心',
      contactPerson: '刘博士',
      contactPhone: '13500135005',
      sampleCount: 1,
      sampleTypes: ['化学品样本'],
      testItems: ['毒理学检测', '纯度分析'],
      status: 'pending',
      statusText: '待接收',
      urgency: 'urgent',
      urgencyText: '紧急',
      submittedAt: '2025-01-22 08:30:00',
      expectedDate: '2025-01-27',
      progress: 0,
    },
  ]
}

/**
 * 送检列表页面组件
 * @returns 送检列表页面
 */
const SubmissionList: React.FC = () => {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  
  // 使用数据缓存Hook
  const {
    data: allSubmissions = [],
    loading,
    error,
    refresh,
  } = useDataCache<SubmissionRecord[]>('submissions', fetchSubmissions)
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  
  // 搜索防抖
  const { debouncedSearchTerm } = useSearchDebounce(
    searchTerm,
    () => {}, // 空的搜索回调，因为我们在useMemo中处理搜索
    300,
    0
  )

  // 过滤后的数据（包含搜索和筛选）
  const filteredSubmissions = useMemo(() => {
    if (!allSubmissions) return []
    
    return allSubmissions.filter(submission => {
      // 状态筛选
      const statusMatch = !statusFilter || submission.status === statusFilter
      // 紧急程度筛选
      const urgencyMatch = !urgencyFilter || submission.urgency === urgencyFilter
      // 搜索匹配
      const searchMatch = !debouncedSearchTerm || 
        submission.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        submission.clientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        submission.contactPerson.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      return statusMatch && urgencyMatch && searchMatch
    })
  }, [allSubmissions, statusFilter, urgencyFilter, debouncedSearchTerm])
  
  // 统计数据（使用缓存优化）
  const statistics = useMemo(() => {
    if (!allSubmissions) return { total: 0, pending: 0, inProgress: 0, completed: 0 }
    
    return {
      total: allSubmissions.length,
      pending: allSubmissions.filter(s => s.status === 'pending' || s.status === 'received').length,
      inProgress: allSubmissions.filter(s => s.status === 'testing' || s.status === 'reporting').length,
      completed: allSubmissions.filter(s => s.status === 'completed').length,
    }
  }, [allSubmissions])

  // 更新分页总数
  useMemo(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSubmissions.length,
    }))
  }, [filteredSubmissions.length])

  /**
   * 获取状态徽章（使用useCallback优化）
   * @param status 状态
   * @param statusText 状态文本
   * @returns 状态徽章组件
   */
  const getStatusBadge = useCallback((status: string, statusText: string) => {
    return <StatusBadge status={status} customLabel={statusText} />
  }, [])

  /**
   * 获取紧急程度徽章（使用useCallback优化）
   * @param urgency 紧急程度
   * @param urgencyText 紧急程度文本
   * @returns 紧急程度徽章组件
   */
  const getUrgencyBadge = useCallback((urgency: string, urgencyText: string) => {
    return <PriorityBadge priority={urgency} customLabel={urgencyText} />
  }, [])

  // 表格列配置
  const columns: TableColumn<SubmissionRecord>[] = [
    {
      key: 'id',
      title: '送检编号',
      dataIndex: 'id',
      width: 120,
      sortable: true,
      render: (value, record) => (
        <Link
          to={`/submission/${record.id}`}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'client',
      title: '客户信息',
      dataIndex: 'clientName',
      width: 200,
      sortable: true,
      render: (value, record) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500'>
            {record.contactPerson} · {record.contactPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'samples',
      title: '样本信息',
      dataIndex: 'sampleCount',
      width: 150,
      render: (value, record) => (
        <div>
          <div className='font-medium text-gray-900'>{value} 个样本</div>
          <div className='text-sm text-gray-500'>
            {record.sampleTypes.join(', ')}
          </div>
        </div>
      ),
    },
    {
      key: 'testItems',
      title: '检测项目',
      dataIndex: 'testItems',
      width: 200,
      render: (value: string[]) => (
        <div className='max-w-xs'>
          <div className='text-sm text-gray-900'>
            {value.slice(0, 2).join(', ')}
            {value.length > 2 && (
              <span className='text-gray-500'> 等{value.length}项</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'urgency',
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 100,
      sortable: true,
      render: (value, record) => getUrgencyBadge(value, record.urgencyText),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 120,
      sortable: true,
      render: (value, record) => (
        <div>
          {getStatusBadge(value, record.statusText)}
          <div className='mt-1'>
            <div className='w-full bg-gray-200 rounded-full h-1.5'>
              <div
                className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                style={{ width: `${record.progress}%` }}
              ></div>
            </div>
            <div className='text-xs text-gray-500 mt-1'>{record.progress}%</div>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      title: '时间信息',
      dataIndex: 'submittedAt',
      width: 150,
      sortable: true,
      render: (value, record) => (
        <div className='text-sm'>
          <div className='text-gray-900'>提交：{value.split(' ')[0]}</div>
          <div className='text-gray-500'>预期：{record.expectedDate}</div>
          {record.actualDate && (
            <div className='text-green-600'>完成：{record.actualDate}</div>
          )}
        </div>
      ),
    },
  ]

  // 表格操作按钮
  const actions: TableAction<SubmissionRecord>[] = [
    {
      key: 'view',
      label: '查看',
      icon: <Eye className='w-4 h-4' />,
      onClick: record => navigate(`/submission/${record.id}`),
      type: 'primary',
    },
    {
      key: 'edit',
      label: '编辑',
      icon: <Edit className='w-4 h-4' />,
      onClick: record => {
        if (record.status === 'completed' || record.status === 'cancelled') {
          toast.error('已完成或已取消的送检申请不能编辑')
          return
        }
        navigate(`/submission/${record.id}/edit`)
      },
      disabled: record =>
        record.status === 'completed' || record.status === 'cancelled',
    },
    {
      key: 'report',
      label: '报告',
      icon: <FileText className='w-4 h-4' />,
      onClick: record => {
        if (record.status !== 'completed') {
          toast.error('只有已完成的送检申请才能查看报告')
          return
        }
        navigate(`/submission/${record.id}/report`)
      },
      disabled: record => record.status !== 'completed',
    },
  ]

  /**
   * 处理分页变化（使用useCallback优化）
   * @param page 页码
   * @param pageSize 每页大小
   */
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }))
  }, [])

  /**
   * 处理搜索（使用useCallback优化）
   * @param value 搜索值
   */
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
  }, [setSearchTerm])

  /**
   * 重置筛选（使用useCallback优化）
   */
  const resetFilters = useCallback(() => {
    setStatusFilter('')
    setUrgencyFilter('')
    setSearchTerm('')
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
      <div className='space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>送检管理</h1>
          <p className='text-gray-600 mt-1'>管理和跟踪送检申请</p>
        </div>
        <Link
          to='/submission/create'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <Plus className='w-4 h-4 mr-2' />
          新建送检
        </Link>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <SkeletonLoader type="cards" count={4} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Calendar className='h-8 w-8 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>总送检数</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {statistics.total}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center'>
                  <span className='text-yellow-600 font-semibold text-sm'>
                    待
                  </span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>待处理</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {statistics.pending}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 font-semibold text-sm'>进</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>进行中</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {statistics.inProgress}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <span className='text-green-600 font-semibold text-sm'>完</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>已完成</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {statistics.completed}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选条件 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                状态筛选
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                紧急程度
              </label>
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {urgencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-end'>
              <button
                onClick={resetFilters}
                className='w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                重置筛选
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 送检列表 */}
      <DataTable
        columns={columns}
        dataSource={filteredSubmissions}
        rowKey='id'
        loading={loading}
        searchable
        searchPlaceholder='搜索送检编号、客户名称、联系人...'
        onSearch={handleSearch}
        actions={actions}
        pagination={{
          ...pagination,
          onChange: handlePaginationChange,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        size='middle'
        striped
      />
      </div>
    </ErrorBoundary>
  )
}

// 使用memo优化组件
export default memo(SubmissionList)
