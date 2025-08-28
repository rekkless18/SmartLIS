/**
 * 质控管理页面
 * 处理质谱实验质控管理
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 质控状态选项
const qcStatusOptions = [
  { value: 'pass', label: '通过', color: 'bg-green-100 text-green-800' },
  { value: 'warning', label: '警告', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fail', label: '失败', color: 'bg-red-100 text-red-800' },
  { value: 'pending', label: '待检查', color: 'bg-gray-100 text-gray-800' },
]

// 质控类型选项
const qcTypeOptions = [
  { value: 'blank', label: '空白对照' },
  { value: 'standard', label: '标准品' },
  { value: 'duplicate', label: '重复样本' },
  { value: 'spike', label: '加标回收' },
  { value: 'internal', label: '内标' },
]

// 质控项目接口
interface QualityControlItem {
  id: string
  qcNo: string
  experimentId: string
  experimentNo: string
  qcType: string
  sampleName: string
  targetCompound: string
  expectedValue: number
  measuredValue: number
  unit: string
  deviation: number
  recoveryRate?: number
  status: string
  operator: string
  testDate: string
  instrument: string
  comments?: string
  createdAt: string
  updatedAt: string
}

// 模拟质控数据
const mockQcData: QualityControlItem[] = [
  {
    id: '1',
    qcNo: 'QC-2025-001',
    experimentId: 'MS-2025-001',
    experimentNo: 'MS-2025-001',
    qcType: 'standard',
    sampleName: '葡萄糖标准品',
    targetCompound: '葡萄糖',
    expectedValue: 100.0,
    measuredValue: 98.5,
    unit: 'mg/L',
    deviation: -1.5,
    status: 'pass',
    operator: '张三',
    testDate: '2025-01-20 10:30:00',
    instrument: 'LC-MS-8060',
    comments: '质控结果正常',
    createdAt: '2025-01-20 10:30:00',
    updatedAt: '2025-01-20 10:30:00',
  },
  {
    id: '2',
    qcNo: 'QC-2025-002',
    experimentId: 'MS-2025-001',
    experimentNo: 'MS-2025-001',
    qcType: 'blank',
    sampleName: '空白对照',
    targetCompound: '葡萄糖',
    expectedValue: 0.0,
    measuredValue: 2.1,
    unit: 'mg/L',
    deviation: 2.1,
    status: 'warning',
    operator: '张三',
    testDate: '2025-01-20 10:45:00',
    instrument: 'LC-MS-8060',
    comments: '空白对照有轻微污染',
    createdAt: '2025-01-20 10:45:00',
    updatedAt: '2025-01-20 10:45:00',
  },
  {
    id: '3',
    qcNo: 'QC-2025-003',
    experimentId: 'MS-2025-002',
    experimentNo: 'MS-2025-002',
    qcType: 'spike',
    sampleName: '加标样本',
    targetCompound: '咖啡因',
    expectedValue: 50.0,
    measuredValue: 47.8,
    unit: 'μg/L',
    deviation: -2.2,
    recoveryRate: 95.6,
    status: 'pass',
    operator: '李四',
    testDate: '2025-01-21 14:20:00',
    instrument: 'GC-MS-QP2020',
    createdAt: '2025-01-21 14:20:00',
    updatedAt: '2025-01-21 14:20:00',
  },
  {
    id: '4',
    qcNo: 'QC-2025-004',
    experimentId: 'MS-2025-003',
    experimentNo: 'MS-2025-003',
    qcType: 'duplicate',
    sampleName: '重复样本',
    targetCompound: '蛋白质',
    expectedValue: 25.0,
    measuredValue: 31.2,
    unit: 'mg/mL',
    deviation: 6.2,
    status: 'fail',
    operator: '王五',
    testDate: '2025-01-21 16:15:00',
    instrument: 'MALDI-TOF-5800',
    comments: '重复性超出允许范围，需要重新测试',
    createdAt: '2025-01-21 16:15:00',
    updatedAt: '2025-01-21 16:15:00',
  },
]

/**
 * 质控管理页面组件
 * @returns 质控管理页面
 */
const QualityControl: React.FC = () => {
  const [qcData, setQcData] = useState<QualityControlItem[]>([])
  const [filteredData, setFilteredData] = useState<QualityControlItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * 加载质控数据
   */
  const loadQcData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setQcData(mockQcData)
      setFilteredData(mockQcData)
    } catch (error) {
      toast.error('加载质控数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 筛选数据
   */
  const filterData = () => {
    let filtered = qcData

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.qcNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.experimentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sampleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.targetCompound
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.operator.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(item => item.qcType === typeFilter)
    }

    setFilteredData(filtered)
  }

  /**
   * 处理删除质控项目
   * @param id 质控项目ID
   */
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个质控项目吗？')) {
      return
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setQcData(prev => prev.filter(item => item.id !== id))
      toast.success('删除成功')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  /**
   * 重新执行质控检查
   * @param id 质控项目ID
   */
  const handleRecheck = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('质控检查已重新执行')
      loadQcData() // 重新加载数据
    } catch (error) {
      toast.error('重新检查失败')
    }
  }

  // 获取状态标签样式
  const getStatusLabel = (status: string) => {
    const option = qcStatusOptions.find(opt => opt.value === status)
    return option
      ? { label: option.label, color: option.color }
      : { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  // 获取质控类型标签
  const getTypeLabel = (type: string) => {
    const option = qcTypeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className='w-4 h-4 text-green-600' />
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-yellow-600' />
      case 'fail':
        return <XCircle className='w-4 h-4 text-red-600' />
      default:
        return <div className='w-4 h-4 bg-gray-400 rounded-full' />
    }
  }

  // 计算偏差百分比
  const getDeviationPercentage = (expected: number, measured: number) => {
    if (expected === 0) return measured === 0 ? 0 : 100
    return ((measured - expected) / expected) * 100
  }

  // 表格列配置
  const columns = [
    {
      key: 'qcNo',
      title: '质控编号',
      width: 120,
      render: (value: string, record: QualityControlItem) => (
        <Link
          to={`/quality-control/${record.id}`}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'experimentNo',
      title: '实验编号',
      width: 120,
      render: (value: string) => (
        <Link
          to={`/experiment/${value}`}
          className='text-blue-600 hover:text-blue-800'
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'qcType',
      title: '质控类型',
      width: 100,
      render: (value: string) => (
        <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium'>
          {getTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'sampleName',
      title: '样本名称',
      width: 150,
    },
    {
      key: 'targetCompound',
      title: '目标化合物',
      width: 120,
    },
    {
      key: 'values',
      title: '测试结果',
      width: 200,
      render: (_: any, record: QualityControlItem) => (
        <div className='space-y-1'>
          <div className='text-sm'>
            <span className='text-gray-600'>期望值：</span>
            <span className='font-medium'>
              {record.expectedValue} {record.unit}
            </span>
          </div>
          <div className='text-sm'>
            <span className='text-gray-600'>测量值：</span>
            <span className='font-medium'>
              {record.measuredValue} {record.unit}
            </span>
          </div>
          <div className='text-sm'>
            <span className='text-gray-600'>偏差：</span>
            <span
              className={`font-medium ${
                Math.abs(
                  getDeviationPercentage(
                    record.expectedValue,
                    record.measuredValue
                  )
                ) > 10
                  ? 'text-red-600'
                  : Math.abs(
                        getDeviationPercentage(
                          record.expectedValue,
                          record.measuredValue
                        )
                      ) > 5
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}
            >
              {getDeviationPercentage(
                record.expectedValue,
                record.measuredValue
              ).toFixed(1)}
              %
            </span>
          </div>
          {record.recoveryRate && (
            <div className='text-sm'>
              <span className='text-gray-600'>回收率：</span>
              <span className='font-medium'>{record.recoveryRate}%</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (value: string) => {
        const { label, color } = getStatusLabel(value)
        return (
          <div className='flex items-center space-x-2'>
            {getStatusIcon(value)}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
            >
              {label}
            </span>
          </div>
        )
      },
    },
    {
      key: 'operator',
      title: '操作员',
      width: 80,
    },
    {
      key: 'testDate',
      title: '测试时间',
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
      key: 'instrument',
      title: '仪器设备',
      width: 120,
    },
    {
      key: 'comments',
      title: '备注',
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
      width: 150,
      render: (_: any, record: QualityControlItem) => (
        <div className='flex space-x-2'>
          <Link
            to={`/quality-control/${record.id}`}
            className='text-blue-600 hover:text-blue-800'
            title='查看详情'
          >
            <Eye className='w-4 h-4' />
          </Link>
          <Link
            to={`/quality-control/${record.id}/edit`}
            className='text-green-600 hover:text-green-800'
            title='编辑'
          >
            <Edit className='w-4 h-4' />
          </Link>
          <button
            onClick={() => handleRecheck(record.id)}
            className='text-purple-600 hover:text-purple-800'
            title='重新检查'
          >
            <TrendingUp className='w-4 h-4' />
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

  // 统计数据
  const stats = {
    total: qcData.length,
    pass: qcData.filter(item => item.status === 'pass').length,
    warning: qcData.filter(item => item.status === 'warning').length,
    fail: qcData.filter(item => item.status === 'fail').length,
    pending: qcData.filter(item => item.status === 'pending').length,
  }

  // 计算通过率
  const passRate =
    stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(1) : '0'

  useEffect(() => {
    loadQcData()
  }, [])

  useEffect(() => {
    filterData()
  }, [searchTerm, statusFilter, typeFilter, qcData])

  return (
    <div className='p-6'>
      {/* 页面标题 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>质控管理</h1>
        <p className='text-gray-600 mt-1'>管理质谱实验质控项目，确保数据质量</p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
          <div className='text-sm text-gray-600'>总质控数</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-green-600'>{stats.pass}</div>
          <div className='text-sm text-gray-600'>通过</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-yellow-600'>
            {stats.warning}
          </div>
          <div className='text-sm text-gray-600'>警告</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-red-600'>{stats.fail}</div>
          <div className='text-sm text-gray-600'>失败</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-gray-600'>
            {stats.pending}
          </div>
          <div className='text-sm text-gray-600'>待检查</div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='text-2xl font-bold text-blue-600'>{passRate}%</div>
          <div className='text-sm text-gray-600'>通过率</div>
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
                placeholder='搜索质控编号、实验编号、样本名称或化合物...'
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
                {qcStatusOptions.map(option => (
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
              {qcTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Link
              to='/quality-control/create'
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2'
            >
              <Plus className='w-4 h-4' />
              <span>新建质控</span>
            </Link>
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
    </div>
  )
}

export default QualityControl
