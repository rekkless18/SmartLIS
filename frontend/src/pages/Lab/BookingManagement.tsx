/**
 * 预约管理页面
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui'
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Check,
  X,
  Eye,
  Info,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import FormBuilder from '../../components/FormBuilder'
import { toast } from 'sonner'
import dayjs from 'dayjs'

// 预约数据接口
interface Booking {
  id: string
  equipmentId: string
  equipmentName: string
  userId: string
  userName: string
  department: string
  startTime: string
  endTime: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  notes: string
  createdAt: string
  updatedAt: string
}

// 设备数据接口
interface Equipment {
  id: string
  name: string
  model: string
  location: string
  status: 'available' | 'occupied' | 'maintenance' | 'offline'
  category: string
}

// 预约状态配置
const bookingStatusConfig = {
  pending: { label: '待审核', color: 'processing' },
  approved: { label: '已批准', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
  completed: { label: '已完成', color: 'default' },
  cancelled: { label: '已取消', color: 'warning' },
}

// 优先级配置
const priorityConfig = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'processing' },
  high: { label: '高', color: 'warning' },
  urgent: { label: '紧急', color: 'error' },
}

// 设备状态配置
const equipmentStatusConfig = {
  available: { label: '可用', color: 'success' },
  occupied: { label: '使用中', color: 'processing' },
  maintenance: { label: '维护中', color: 'warning' },
  offline: { label: '离线', color: 'error' },
}

// 模拟设备数据
const mockEquipmentData: Equipment[] = [
  {
    id: 'EQ001',
    name: 'PCR扩增仪',
    model: 'ABI 7500',
    location: '分子实验室A',
    status: 'available',
    category: '分子生物学设备',
  },
  {
    id: 'EQ002',
    name: '离心机',
    model: 'Eppendorf 5424R',
    location: '准备间',
    status: 'occupied',
    category: '通用设备',
  },
  {
    id: 'EQ003',
    name: '显微镜',
    model: 'Olympus BX53',
    location: '观察室',
    status: 'available',
    category: '观察设备',
  },
]

// 模拟预约数据
const mockBookingData: Booking[] = [
  {
    id: 'BK001',
    equipmentId: 'EQ001',
    equipmentName: 'PCR扩增仪',
    userId: 'U001',
    userName: '张三',
    department: '分子实验室',
    startTime: '2025-01-26 09:00:00',
    endTime: '2025-01-26 12:00:00',
    purpose: '基因扩增实验',
    status: 'approved',
    priority: 'high',
    approvedBy: '李主任',
    approvedAt: '2025-01-25 16:30:00',
    notes: '需要提前准备试剂',
    createdAt: '2025-01-25 14:00:00',
    updatedAt: '2025-01-25 16:30:00',
  },
  {
    id: 'BK002',
    equipmentId: 'EQ002',
    equipmentName: '离心机',
    userId: 'U002',
    userName: '李四',
    department: '样本处理室',
    startTime: '2025-01-26 14:00:00',
    endTime: '2025-01-26 16:00:00',
    purpose: '样本离心分离',
    status: 'pending',
    priority: 'medium',
    notes: '常规样本处理',
    createdAt: '2025-01-25 15:30:00',
    updatedAt: '2025-01-25 15:30:00',
  },
  {
    id: 'BK003',
    equipmentId: 'EQ003',
    equipmentName: '显微镜',
    userId: 'U003',
    userName: '王五',
    department: '质控室',
    startTime: '2025-01-27 10:00:00',
    endTime: '2025-01-27 11:30:00',
    purpose: '细胞形态观察',
    status: 'rejected',
    priority: 'low',
    rejectedReason: '设备维护期间不可用',
    notes: '质控检查',
    createdAt: '2025-01-25 13:00:00',
    updatedAt: '2025-01-25 17:00:00',
  },
]

const BookingManagement: React.FC = () => {
  const [bookingData, setBookingData] = useState<Booking[]>(mockBookingData)
  const [equipmentData, setEquipmentData] =
    useState<Equipment[]>(mockEquipmentData)
  const [loading, setLoading] = useState(false)
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState<Partial<Booking>>({})
  const [approvalFormData, setApprovalFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState('bookings')
  const [selectedDate, setSelectedDate] = useState(dayjs())

  // 创建表单实例
  const [form] = useState({
    setFieldsValue: (values: any) => setFormData(values),
    validateFields: () => Promise.resolve(formData),
    resetFields: () => setFormData({})
  })
  
  const [approvalForm] = useState({
    setFieldsValue: (values: any) => setApprovalFormData(values),
    validateFields: () => Promise.resolve(approvalFormData),
    resetFields: () => setApprovalFormData({})
  })

  // 获取状态徽章
  const getStatusBadge = (status: string, config: any) => {
    const statusInfo = config[status] || { label: status, color: 'default' }
    return <Badge status={statusInfo.color as any} text={statusInfo.label} />
  }

  // 加载预约数据
  const loadBookingData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBookingData(mockBookingData)
    } catch (error) {
      toast.error('加载预约数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载设备数据
  const loadEquipmentData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEquipmentData(mockEquipmentData)
    } catch (error) {
      toast.error('加载设备数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理预约操作
  const handleBookingView = (record: Booking) => {
    setCurrentBooking(record)
    form.setFieldsValue({
      ...record,
      timeRange: [dayjs(record.startTime), dayjs(record.endTime)],
    })
    setBookingModalVisible(true)
  }

  const handleBookingEdit = (record: Booking) => {
    setCurrentBooking(record)
    form.setFieldsValue({
      ...record,
      timeRange: [dayjs(record.startTime), dayjs(record.endTime)],
    })
    setBookingModalVisible(true)
  }

  const handleBookingDelete = (record: Booking) => {
    if (window.confirm(`确定要删除预约 "${record.equipmentName}" 吗？`)) {
      setBookingData(prev => prev.filter(item => item.id !== record.id))
      toast.success('预约删除成功')
    }
  }

  const handleBookingApproval = (record: Booking) => {
    setCurrentBooking(record)
    approvalForm.setFieldsValue({
      id: record.id,
      equipmentName: record.equipmentName,
      userName: record.userName,
      timeRange: `${record.startTime} - ${record.endTime}`,
      purpose: record.purpose,
    })
    setApprovalModalVisible(true)
  }

  const handleBookingCancel = (record: Booking) => {
    if (window.confirm(`确定要取消预约 "${record.equipmentName}" 吗？`)) {
      setBookingData(prev =>
        prev.map(item =>
          item.id === record.id
            ? {
                ...item,
                status: 'cancelled',
                updatedAt: new Date().toLocaleString(),
              }
            : item
        )
      )
      toast.success('预约取消成功')
    }
  }

  // 保存预约
  const handleBookingSave = async () => {
    try {
      const values = await form.validateFields()
      const [startTime, endTime] = values.timeRange

      const bookingData = {
        ...values,
        startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
      }
      delete bookingData.timeRange

      if (currentBooking) {
        // 编辑预约
        setBookingData(prev =>
          prev.map(item =>
            item.id === currentBooking.id
              ? {
                  ...item,
                  ...bookingData,
                  updatedAt: new Date().toLocaleString(),
                }
              : item
          )
        )
        toast.success('预约更新成功')
      } else {
        // 新增预约
        const newBooking: Booking = {
          ...bookingData,
          id: `BK${String(bookingData.length + 1).padStart(3, '0')}`,
          status: 'pending',
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }
        setBookingData(prev => [...prev, newBooking])
        toast.success('预约添加成功')
      }
      setBookingModalVisible(false)
      setCurrentBooking(null)
      form.resetFields()
    } catch (error) {
      console.error('保存预约失败:', error)
    }
  }

  // 处理审批
  const handleApprovalSave = async () => {
    try {
      const values = await approvalForm.validateFields()
      if (currentBooking) {
        setBookingData(prev =>
          prev.map(item =>
            item.id === currentBooking.id
              ? {
                  ...item,
                  status: values.action,
                  approvedBy:
                    values.action === 'approved'
                      ? values.approvedBy
                      : undefined,
                  approvedAt:
                    values.action === 'approved'
                      ? new Date().toLocaleString()
                      : undefined,
                  rejectedReason:
                    values.action === 'rejected'
                      ? values.rejectedReason
                      : undefined,
                  updatedAt: new Date().toLocaleString(),
                }
              : item
          )
        )
        toast.success(
          `预约${values.action === 'approved' ? '批准' : '拒绝'}成功`
        )
      }
      setApprovalModalVisible(false)
      setCurrentBooking(null)
      approvalForm.resetFields()
    } catch (error) {
      console.error('审批失败:', error)
    }
  }

  // 预约表格列配置
  const bookingColumns = [
    {
      title: '预约编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '预约人',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 200,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => getStatusBadge(priority, priorityConfig),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status, bookingStatusConfig),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record: Booking) => (
        <div className='flex gap-2 flex-wrap'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleBookingView(record)}
          >
            <Eye className='w-4 h-4 mr-1' />
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleBookingEdit(record)}
              >
                <Edit className='w-4 h-4 mr-1' />
                编辑
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleBookingApproval(record)}
              >
                <Check className='w-4 h-4 mr-1' />
                审批
              </Button>
            </>
          )}
          {(record.status === 'approved' || record.status === 'pending') && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleBookingCancel(record)}
            >
              <X className='w-4 h-4 mr-1' />
              取消
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleBookingDelete(record)}
          >
            <Trash2 className='w-4 h-4 mr-1' />
            删除
          </Button>
        </div>
      ),
    },
  ]

  // 设备表格列配置
  const equipmentColumns = [
    {
      title: '设备编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status, equipmentStatusConfig),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: Equipment) => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            disabled={record.status !== 'available'}
            onClick={() => {
              setCurrentBooking(null)
              setFormData({
                equipmentId: record.id,
                equipmentName: record.name,
              })
              setBookingModalVisible(true)
            }}
          >
            <Calendar className='w-4 h-4 mr-1' />
            预约
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              // 查看设备预约情况
              const equipmentBookings = bookingData.filter(
                booking =>
                  booking.equipmentId === record.id &&
                  (booking.status === 'approved' ||
                    booking.status === 'pending')
              )
              const message = equipmentBookings.length > 0 
                ? equipmentBookings.map(booking => 
                    `${booking.userName} - ${booking.department}\n${booking.startTime} ~ ${booking.endTime}\n${booking.purpose}`
                  ).join('\n\n')
                : '暂无预约'
              alert(`${record.name} 预约情况:\n\n${message}`)
            }}
          >
            <Info className='w-4 h-4 mr-1' />
            查看预约
          </Button>
        </div>
      ),
    },
  ]

  // 表格操作配置
  const bookingTableActions = {
    showAdd: true,
    addText: '新增预约',
    onAdd: () => {
      setCurrentBooking(null)
      setFormData({})
      setBookingModalVisible(true)
    },
  }

  // 预约表单配置
  const bookingFormFields = [
    {
      name: 'equipmentId',
      label: '设备',
      type: 'select',
      required: true,
      options: equipmentData
        .filter(eq => eq.status === 'available')
        .map(eq => ({ label: `${eq.name} (${eq.location})`, value: eq.id })),
      rules: [{ required: true, message: '请选择设备' }],
      onChange: (value: string) => {
        const equipment = equipmentData.find(eq => eq.id === value)
        if (equipment) {
          form.setFieldsValue({ equipmentName: equipment.name })
        }
      },
    },
    {
      name: 'equipmentName',
      label: '设备名称',
      type: 'input',
      disabled: true,
    },
    {
      name: 'userName',
      label: '预约人',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入预约人' }],
    },
    {
      name: 'department',
      label: '部门',
      type: 'select',
      required: true,
      options: [
        { label: '分子实验室', value: '分子实验室' },
        { label: '样本处理室', value: '样本处理室' },
        { label: '质控室', value: '质控室' },
        { label: '准备间', value: '准备间' },
      ],
      rules: [{ required: true, message: '请选择部门' }],
    },
    {
      name: 'timeRange',
      label: '预约时间',
      type: 'datetimerange',
      required: true,
      rules: [{ required: true, message: '请选择预约时间' }],
    },
    {
      name: 'priority',
      label: '优先级',
      type: 'select',
      required: true,
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
        { label: '紧急', value: 'urgent' },
      ],
      rules: [{ required: true, message: '请选择优先级' }],
    },
    {
      name: 'purpose',
      label: '使用目的',
      type: 'textarea',
      span: 24,
      required: true,
      rules: [{ required: true, message: '请输入使用目的' }],
    },
    {
      name: 'notes',
      label: '备注',
      type: 'textarea',
      span: 24,
    },
  ]

  // 审批表单配置
  const approvalFormFields = [
    {
      name: 'equipmentName',
      label: '设备名称',
      type: 'input',
      disabled: true,
    },
    {
      name: 'userName',
      label: '预约人',
      type: 'input',
      disabled: true,
    },
    {
      name: 'timeRange',
      label: '预约时间',
      type: 'input',
      disabled: true,
    },
    {
      name: 'purpose',
      label: '使用目的',
      type: 'textarea',
      disabled: true,
    },
    {
      name: 'action',
      label: '审批结果',
      type: 'select',
      required: true,
      options: [
        { label: '批准', value: 'approved' },
        { label: '拒绝', value: 'rejected' },
      ],
      rules: [{ required: true, message: '请选择审批结果' }],
    },
    {
      name: 'approvedBy',
      label: '审批人',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入审批人' }],
      dependencies: ['action'],
      hidden: (values: any) => values?.action !== 'approved',
    },
    {
      name: 'rejectedReason',
      label: '拒绝原因',
      type: 'textarea',
      span: 24,
      required: true,
      rules: [{ required: true, message: '请输入拒绝原因' }],
      dependencies: ['action'],
      hidden: (values: any) => values?.action !== 'rejected',
    },
  ]

  // 日历数据处理
  const getCalendarData = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const dayBookings = bookingData.filter(booking => {
      const bookingDate = dayjs(booking.startTime).format('YYYY-MM-DD')
      return (
        bookingDate === dateStr &&
        (booking.status === 'approved' || booking.status === 'pending')
      )
    })
    return dayBookings
  }

  const dateCellRender = (date: dayjs.Dayjs) => {
    const bookings = getCalendarData(date)
    return (
      <div className='h-full'>
        {bookings.slice(0, 2).map(booking => (
          <div
            key={booking.id}
            className='text-xs p-1 mb-1 bg-blue-100 rounded truncate'
          >
            {booking.equipmentName} - {booking.userName}
          </div>
        ))}
        {bookings.length > 2 && (
          <div className='text-xs text-gray-500'>
            +{bookings.length - 2} 更多
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookingData()
    } else if (activeTab === 'equipment') {
      loadEquipmentData()
    }
  }, [activeTab])

  // 表格列配置已在前面定义

  // 统计数据
  const bookingStats = {
    total: bookingData.length,
    pending: bookingData.filter(item => item.status === 'pending').length,
    approved: bookingData.filter(item => item.status === 'approved').length,
    completed: bookingData.filter(item => item.status === 'completed').length,
  }

  const equipmentStats = {
    total: equipmentData.length,
    available: equipmentData.filter(item => item.status === 'available').length,
    occupied: equipmentData.filter(item => item.status === 'occupied').length,
    maintenance: equipmentData.filter(item => item.status === 'maintenance')
      .length,
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>预约管理</h1>
        <p className='text-gray-600 mt-1'>管理实验室设备预约和时间安排</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='bookings'>预约管理</TabsTrigger>
          <TabsTrigger value='equipment'>设备状态</TabsTrigger>
          <TabsTrigger value='calendar'>预约日历</TabsTrigger>
        </TabsList>
        <TabsContent value='bookings'>
          {/* 预约统计卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {bookingStats.total}
                </div>
                <div className='text-gray-500 text-sm'>预约总数</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {bookingStats.pending}
                </div>
                <div className='text-gray-500 text-sm'>待审核</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {bookingStats.approved}
                </div>
                <div className='text-gray-500 text-sm'>已批准</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {bookingStats.completed}
                </div>
                <div className='text-gray-500 text-sm'>已完成</div>
              </div>
            </Card>
          </div>

          {/* 预约列表 */}
          <DataTable
            columns={bookingColumns}
            dataSource={bookingData}
            loading={loading}
            actions={bookingTableActions}
            rowKey='id'
          />
        </TabsContent>

        <TabsContent value='equipment'>
          {/* 设备统计卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {equipmentStats.total}
                </div>
                <div className='text-gray-500 text-sm'>设备总数</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {equipmentStats.available}
                </div>
                <div className='text-gray-500 text-sm'>可用设备</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {equipmentStats.occupied}
                </div>
                <div className='text-gray-500 text-sm'>使用中</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {equipmentStats.maintenance}
                </div>
                <div className='text-gray-500 text-sm'>维护中</div>
              </div>
            </Card>
          </div>

          {/* 设备列表 */}
          <DataTable
            columns={equipmentColumns}
            dataSource={equipmentData}
            loading={loading}
            rowKey='id'
          />
        </TabsContent>

        <TabsContent value='calendar'>
          <Card>
            <CardContent className='p-6'>
              <div className='text-center text-gray-500'>
                <Calendar className='h-8 w-8 mx-auto mb-2' />
                <p>预约日历功能开发中...</p>
                <p className='text-sm mt-2'>当前选择日期: {selectedDate.format('YYYY-MM-DD')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 预约模态框 */}
      <Modal
        title={currentBooking ? '编辑预约' : '新增预约'}
        open={bookingModalVisible}
        onCancel={() => {
          setBookingModalVisible(false)
          setCurrentBooking(null)
          form.resetFields()
        }}
        onOk={handleBookingSave}
        width={800}
        destroyOnClose
      >
        <FormBuilder
          form={form}
          fields={bookingFormFields}
          layout='vertical'
          colSpan={12}
        />
      </Modal>

      {/* 审批模态框 */}
      <Modal
        title='预约审批'
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false)
          setCurrentBooking(null)
          approvalForm.resetFields()
        }}
        onOk={handleApprovalSave}
        width={600}
        destroyOnClose
      >
        <FormBuilder
          form={approvalForm}
          fields={approvalFormFields}
          layout='vertical'
          colSpan={24}
        />
      </Modal>
    </div>
  )
}

export default BookingManagement
