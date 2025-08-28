/**
 * 样本出入库页面
 * 样本存储管理功能页面 - 重构版本
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  CheckSquare,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 存储位置选项
const storageLocationOptions = [
  { label: 'A区-冷藏室', value: 'A-cold' },
  { label: 'B区-常温室', value: 'B-normal' },
  { label: 'C区-冷冻室', value: 'C-frozen' },
  { label: 'D区-危化品室', value: 'D-hazard' },
  { label: 'E区-临时存放', value: 'E-temp' },
]

// 存储条件选项
const storageConditionOptions = [
  { label: '常温(15-25℃)', value: 'normal' },
  { label: '冷藏(2-8℃)', value: 'cold' },
  { label: '冷冻(-18℃以下)', value: 'frozen' },
  { label: '干燥通风', value: 'dry' },
  { label: '避光保存', value: 'dark' },
]

// 出库原因选项
const outboundReasonOptions = [
  { label: '检测使用', value: 'testing' },
  { label: '样本转移', value: 'transfer' },
  { label: '质量控制', value: 'qc' },
  { label: '样本销毁', value: 'destroy' },
  { label: '其他', value: 'other' },
]

// 库存记录接口
interface StorageRecord {
  id: string
  sampleCode: string
  sampleName: string
  operation: 'inbound' | 'outbound'
  quantity: number
  unit: string
  location: string
  condition: string
  reason?: string
  operator: string
  operatedAt: string
  notes: string
  remainingQuantity: number
}

// 出库单接口
interface OutboundOrder {
  id: string
  orderCode: string
  sampleCode: string
  sampleName: string
  quantity: number
  unit: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'completed'
  notes: string
}

// 已接收样本接口
interface ReceivedSample {
  id: string
  sampleCode: string
  sampleName: string
  quantity: number
  unit: string
  location: string
  condition: string
  receivedAt: string
  status: 'available' | 'reserved' | 'used'
}

const SampleStorage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<
    'inbound' | 'outbound' | 'records'
  >('inbound')
  const [loading, setLoading] = useState(false)

  // 样本入库相关状态
  const [outboundOrders, setOutboundOrders] = useState<OutboundOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OutboundOrder[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  // 样本出库相关状态
  const [receivedSamples, setReceivedSamples] = useState<ReceivedSample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<ReceivedSample[]>([])
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])

  // 出库记录相关状态
  const [records, setRecords] = useState<StorageRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<StorageRecord[]>([])

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // 模拟出库单数据
  const mockOutboundOrders: OutboundOrder[] = [
    {
      id: '1',
      orderCode: 'OUT2025010001',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      quantity: 1,
      unit: 'L',
      requestedBy: '检测部门',
      requestedAt: '2025-01-20T09:00:00Z',
      status: 'approved',
      notes: '用于重金属检测',
    },
    {
      id: '2',
      orderCode: 'OUT2025010002',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      quantity: 2,
      unit: 'kg',
      requestedBy: '质控部门',
      requestedAt: '2025-01-19T14:30:00Z',
      status: 'pending',
      notes: '质量控制检测',
    },
    {
      id: '3',
      orderCode: 'OUT2025010003',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      quantity: 1,
      unit: '份',
      requestedBy: '环境部门',
      requestedAt: '2025-01-18T11:15:00Z',
      status: 'approved',
      notes: 'VOCs检测',
    },
  ]

  // 模拟已接收样本数据
  const mockReceivedSamples: ReceivedSample[] = [
    {
      id: '1',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      quantity: 2,
      unit: 'L',
      location: 'A-cold',
      condition: 'cold',
      receivedAt: '2025-01-20T10:30:00Z',
      status: 'available',
    },
    {
      id: '2',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      quantity: 5,
      unit: 'kg',
      location: 'B-normal',
      condition: 'normal',
      receivedAt: '2025-01-19T14:20:00Z',
      status: 'available',
    },
    {
      id: '3',
      sampleCode: 'S2025010004',
      sampleName: '地下水样本',
      quantity: 3,
      unit: 'L',
      location: 'A-cold',
      condition: 'cold',
      receivedAt: '2025-01-17T16:45:00Z',
      status: 'reserved',
    },
  ]

  // 模拟库存记录数据
  const mockRecords: StorageRecord[] = [
    {
      id: '1',
      sampleCode: 'S2025010001',
      sampleName: '工业废水样本',
      operation: 'inbound',
      quantity: 2,
      unit: 'L',
      location: 'A-cold',
      condition: 'cold',
      operator: '张三',
      operatedAt: '2025-01-20T10:30:00Z',
      notes: '新接收样本入库',
      remainingQuantity: 2,
    },
    {
      id: '2',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      operation: 'inbound',
      quantity: 5,
      unit: 'kg',
      location: 'B-normal',
      condition: 'normal',
      operator: '李四',
      operatedAt: '2025-01-19T14:20:00Z',
      notes: '现场采样入库',
      remainingQuantity: 4,
    },
    {
      id: '3',
      sampleCode: 'S2025010002',
      sampleName: '农田土壤样本',
      operation: 'outbound',
      quantity: 1,
      unit: 'kg',
      location: 'B-normal',
      condition: 'normal',
      reason: 'testing',
      operator: '王五',
      operatedAt: '2025-01-21T09:15:00Z',
      notes: '检测使用出库',
      remainingQuantity: 4,
    },
    {
      id: '4',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      operation: 'inbound',
      quantity: 1,
      unit: '份',
      location: 'E-temp',
      condition: 'normal',
      operator: '赵六',
      operatedAt: '2025-01-18T16:45:00Z',
      notes: '临时存放',
      remainingQuantity: 0,
    },
    {
      id: '5',
      sampleCode: 'S2025010003',
      sampleName: '室内空气样本',
      operation: 'outbound',
      quantity: 1,
      unit: '份',
      location: 'E-temp',
      condition: 'normal',
      reason: 'testing',
      operator: '孙七',
      operatedAt: '2025-01-20T11:30:00Z',
      notes: '检测完成出库',
      remainingQuantity: 0,
    },
  ]

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        setOutboundOrders(mockOutboundOrders)
        setFilteredOrders(mockOutboundOrders)
        setReceivedSamples(mockReceivedSamples)
        setFilteredSamples(mockReceivedSamples)
        setRecords(mockRecords)
        setFilteredRecords(mockRecords)
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 筛选和搜索 - 出库单
  useEffect(() => {
    let filtered = outboundOrders

    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.sampleName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [outboundOrders, searchTerm, statusFilter])

  // 筛选和搜索 - 已接收样本
  useEffect(() => {
    let filtered = receivedSamples

    if (searchTerm) {
      filtered = filtered.filter(
        sample =>
          sample.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.sampleName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(sample => sample.status === statusFilter)
    }

    setFilteredSamples(filtered)
  }, [receivedSamples, searchTerm, statusFilter])

  // 筛选和搜索 - 出库记录
  useEffect(() => {
    let filtered = records

    if (searchTerm) {
      filtered = filtered.filter(
        record =>
          record.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.sampleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.operator.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }, [records, searchTerm])

  // 处理样本入库 - 批量处理选中的出库单
  const handleBatchInbound = async () => {
    if (selectedOrders.length === 0) {
      toast.error('请选择要入库的出库单')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 更新出库单状态为已完成
      const updatedOrders = outboundOrders.map(order =>
        selectedOrders.includes(order.id)
          ? { ...order, status: 'completed' as const }
          : order
      )
      setOutboundOrders(updatedOrders)
      setSelectedOrders([])

      toast.success(`成功入库 ${selectedOrders.length} 个样本！`)
    } catch (error) {
      console.error('批量入库失败:', error)
      toast.error('批量入库失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理样本出库 - 批量处理选中的样本
  const handleBatchOutbound = async () => {
    if (selectedSamples.length === 0) {
      toast.error('请选择要出库的样本')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 更新样本状态为已使用
      const updatedSamples = receivedSamples.map(sample =>
        selectedSamples.includes(sample.id)
          ? { ...sample, status: 'used' as const }
          : sample
      )
      setReceivedSamples(updatedSamples)
      setSelectedSamples([])

      toast.success(`成功出库 ${selectedSamples.length} 个样本！`)
    } catch (error) {
      console.error('批量出库失败:', error)
      toast.error('批量出库失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 出库单表格列配置
  const outboundOrderColumns = [
    {
      key: 'selection',
      title: (
        <input
          type='checkbox'
          checked={
            selectedOrders.length === filteredOrders.length &&
            filteredOrders.length > 0
          }
          onChange={e => {
            if (e.target.checked) {
              setSelectedOrders(filteredOrders.map(order => order.id))
            } else {
              setSelectedOrders([])
            }
          }}
          className='rounded border-gray-300'
        />
      ),
      width: 50,
      render: (_: any, record: OutboundOrder) => (
        <input
          type='checkbox'
          checked={selectedOrders.includes(record.id)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedOrders([...selectedOrders, record.id])
            } else {
              setSelectedOrders(selectedOrders.filter(id => id !== record.id))
            }
          }}
          className='rounded border-gray-300'
        />
      ),
    },
    {
      key: 'orderCode',
      title: '出库单号',
      dataIndex: 'orderCode',
      width: 120,
      render: (value: string) => (
        <span className='font-mono text-sm font-medium text-blue-600'>
          {value}
        </span>
      ),
    },
    {
      key: 'sampleCode',
      title: '样本编号',
      dataIndex: 'sampleCode',
      width: 120,
    },
    {
      key: 'sampleName',
      title: '样本名称',
      dataIndex: 'sampleName',
      width: 150,
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      render: (value: number, record: OutboundOrder) => (
        <span className='text-sm'>
          {value} {record.unit}
        </span>
      ),
    },
    {
      key: 'requestedBy',
      title: '申请部门',
      dataIndex: 'requestedBy',
      width: 100,
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => {
        const statusConfig = {
          pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800' },
          approved: { label: '已审批', color: 'bg-green-100 text-green-800' },
          completed: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'requestedAt',
      title: '申请时间',
      dataIndex: 'requestedAt',
      width: 150,
      render: (value: string) => (
        <span className='text-sm'>{new Date(value).toLocaleString()}</span>
      ),
    },
  ]

  // 已接收样本表格列配置
  const receivedSampleColumns = [
    {
      key: 'selection',
      title: (
        <input
          type='checkbox'
          checked={
            selectedSamples.length === filteredSamples.length &&
            filteredSamples.length > 0
          }
          onChange={e => {
            if (e.target.checked) {
              setSelectedSamples(filteredSamples.map(sample => sample.id))
            } else {
              setSelectedSamples([])
            }
          }}
          className='rounded border-gray-300'
        />
      ),
      width: 50,
      render: (_: any, record: ReceivedSample) => (
        <input
          type='checkbox'
          checked={selectedSamples.includes(record.id)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedSamples([...selectedSamples, record.id])
            } else {
              setSelectedSamples(selectedSamples.filter(id => id !== record.id))
            }
          }}
          className='rounded border-gray-300'
          disabled={record.status !== 'available'}
        />
      ),
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
      key: 'sampleName',
      title: '样本名称',
      dataIndex: 'sampleName',
      width: 150,
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      render: (value: number, record: ReceivedSample) => (
        <span className='text-sm'>
          {value} {record.unit}
        </span>
      ),
    },
    {
      key: 'location',
      title: '存储位置',
      dataIndex: 'location',
      width: 120,
      render: (value: string) => {
        const locationLabels = {
          'A-cold': 'A区-冷藏室',
          'B-normal': 'B区-常温室',
          'C-frozen': 'C区-冷冻室',
          'D-hazard': 'D区-危化品室',
          'E-temp': 'E区-临时存放',
        }
        return (
          <span className='text-sm'>
            {locationLabels[value as keyof typeof locationLabels] || value}
          </span>
        )
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => {
        const statusConfig = {
          available: { label: '可用', color: 'bg-green-100 text-green-800' },
          reserved: { label: '预留', color: 'bg-yellow-100 text-yellow-800' },
          used: { label: '已使用', color: 'bg-gray-100 text-gray-800' },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'receivedAt',
      title: '接收时间',
      dataIndex: 'receivedAt',
      width: 150,
      render: (value: string) => (
        <span className='text-sm'>{new Date(value).toLocaleString()}</span>
      ),
    },
  ]

  // 出库记录表格列配置
  const recordColumns = [
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
      key: 'sampleName',
      title: '样本名称',
      dataIndex: 'sampleName',
      width: 150,
    },
    {
      key: 'operation',
      title: '操作类型',
      dataIndex: 'operation',
      width: 100,
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'inbound'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value === 'inbound' ? (
            <>
              <ArrowUpCircle className='w-3 h-3 mr-1' />
              入库
            </>
          ) : (
            <>
              <ArrowDownCircle className='w-3 h-3 mr-1' />
              出库
            </>
          )}
        </span>
      ),
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      render: (value: number, record: StorageRecord) => (
        <span className='text-sm'>
          {value} {record.unit}
        </span>
      ),
    },
    {
      key: 'operator',
      title: '操作人员',
      dataIndex: 'operator',
      width: 100,
    },
    {
      key: 'operatedAt',
      title: '操作时间',
      dataIndex: 'operatedAt',
      width: 150,
      render: (value: string) => (
        <span className='text-sm'>{new Date(value).toLocaleString()}</span>
      ),
    },
  ]

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题 */}
      <div className='bg-white rounded-lg shadow-md border p-6'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/sample')}
            className='p-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>样本出入库管理</h1>
            <p className='text-gray-600 mt-1'>管理样本的存储和出入库操作</p>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className='bg-white rounded-lg shadow-md border'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { key: 'inbound', label: '样本入库', icon: ArrowUpCircle },
              { key: 'outbound', label: '样本出库', icon: ArrowDownCircle },
              { key: 'records', label: '出库记录', icon: Package },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4 mr-2' />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className='p-6'>
          {/* 样本入库 */}
          {activeTab === 'inbound' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <ArrowUpCircle className='w-5 h-5 text-green-600' />
                  <h2 className='text-lg font-semibold text-gray-900'>
                    样本入库
                  </h2>
                  <span className='text-sm text-gray-500'>
                    选择出库单进行批量入库
                  </span>
                </div>
                <button
                  onClick={handleBatchInbound}
                  disabled={selectedOrders.length === 0 || loading}
                  className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                >
                  <CheckSquare className='w-4 h-4 mr-2 inline' />
                  批量入库 ({selectedOrders.length})
                </button>
              </div>

              {/* 筛选条件 */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center space-x-4 mb-4'>
                  <Filter className='w-4 h-4 text-gray-400' />
                  <span className='text-sm font-medium text-gray-700'>
                    筛选条件
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                        placeholder='搜索出库单号、样本编号或名称'
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
                      <option value='pending'>待审批</option>
                      <option value='approved'>已审批</option>
                      <option value='completed'>已完成</option>
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('')
                      }}
                      className='px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors'
                    >
                      清除筛选
                    </button>
                  </div>
                </div>
              </div>

              {/* 出库单列表 */}
              <DataTable
                columns={outboundOrderColumns}
                dataSource={filteredOrders}
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
          )}

          {/* 样本出库 */}
          {activeTab === 'outbound' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <ArrowDownCircle className='w-5 h-5 text-red-600' />
                  <h2 className='text-lg font-semibold text-gray-900'>
                    样本出库
                  </h2>
                  <span className='text-sm text-gray-500'>
                    选择已接收样本进行批量出库
                  </span>
                </div>
                <button
                  onClick={handleBatchOutbound}
                  disabled={selectedSamples.length === 0 || loading}
                  className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                >
                  <CheckSquare className='w-4 h-4 mr-2 inline' />
                  批量出库 ({selectedSamples.length})
                </button>
              </div>

              {/* 筛选条件 */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center space-x-4 mb-4'>
                  <Filter className='w-4 h-4 text-gray-400' />
                  <span className='text-sm font-medium text-gray-700'>
                    筛选条件
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                        placeholder='搜索样本编号或名称'
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
                      <option value='available'>可用</option>
                      <option value='reserved'>预留</option>
                      <option value='used'>已使用</option>
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('')
                      }}
                      className='px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors'
                    >
                      清除筛选
                    </button>
                  </div>
                </div>
              </div>

              {/* 已接收样本列表 */}
              <DataTable
                columns={receivedSampleColumns}
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
          )}

          {/* 出库记录 */}
          {activeTab === 'records' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Package className='w-5 h-5 text-blue-600' />
                  <h2 className='text-lg font-semibold text-gray-900'>
                    出库记录
                  </h2>
                  <span className='text-sm text-gray-500'>
                    查看历史出库记录
                  </span>
                </div>
              </div>

              {/* 筛选条件 */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center space-x-4 mb-4'>
                  <Filter className='w-4 h-4 text-gray-400' />
                  <span className='text-sm font-medium text-gray-700'>
                    筛选条件
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                        placeholder='搜索样本编号、名称或操作人'
                        className='w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>
                  </div>
                  <div className='flex items-end'>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                      }}
                      className='px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors'
                    >
                      清除筛选
                    </button>
                  </div>
                </div>
              </div>

              {/* 记录表格 */}
              <DataTable
                columns={recordColumns}
                dataSource={filteredRecords}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default SampleStorage
