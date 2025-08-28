/**
 * 实验室管理页面
 * 综合管理实验室设备、耗材和预约
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
} from '../../components/ui'
import {
  Wrench,
  FlaskConical,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 统计数据接口
interface LabStats {
  totalEquipment: number
  normalEquipment: number
  maintenanceEquipment: number
  faultEquipment: number
  totalSupplies: number
  lowStockSupplies: number
  expiredSupplies: number
  todayBookings: number
  pendingBookings: number
  approvedBookings: number
}

// 设备状态接口
interface EquipmentStatus {
  id: string
  name: string
  status: 'normal' | 'maintenance' | 'fault' | 'offline'
  location: string
  lastMaintenance: string
}

// 耗材状态接口
interface SupplyStatus {
  id: string
  name: string
  currentStock: number
  minStock: number
  status: 'normal' | 'low_stock' | 'expired' | 'out_of_stock'
  expiryDate: string
}

// 预约状态接口
interface BookingStatus {
  id: string
  equipmentName: string
  userName: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected'
}

// 模拟统计数据
const mockLabStats: LabStats = {
  totalEquipment: 25,
  normalEquipment: 20,
  maintenanceEquipment: 3,
  faultEquipment: 2,
  totalSupplies: 156,
  lowStockSupplies: 8,
  expiredSupplies: 3,
  todayBookings: 12,
  pendingBookings: 4,
  approvedBookings: 8,
}

// 模拟设备状态数据
const mockEquipmentStatus: EquipmentStatus[] = [
  {
    id: 'EQ001',
    name: 'PCR扩增仪',
    status: 'normal',
    location: '分子实验室A',
    lastMaintenance: '2024-12-01',
  },
  {
    id: 'EQ002',
    name: '离心机',
    status: 'maintenance',
    location: '准备间',
    lastMaintenance: '2024-11-15',
  },
  {
    id: 'EQ003',
    name: '显微镜',
    status: 'fault',
    location: '观察室',
    lastMaintenance: '2024-10-20',
  },
]

// 模拟耗材状态数据
const mockSupplyStatus: SupplyStatus[] = [
  {
    id: 'SUP001',
    name: 'PCR试剂盒',
    currentStock: 15,
    minStock: 10,
    status: 'normal',
    expiryDate: '2025-06-30',
  },
  {
    id: 'SUP002',
    name: '离心管',
    currentStock: 8,
    minStock: 20,
    status: 'low_stock',
    expiryDate: '2026-12-31',
  },
  {
    id: 'SUP003',
    name: '移液器吸头',
    currentStock: 0,
    minStock: 5,
    status: 'out_of_stock',
    expiryDate: '2027-03-31',
  },
]

// 模拟预约状态数据
const mockBookingStatus: BookingStatus[] = [
  {
    id: 'BK001',
    equipmentName: 'PCR扩增仪',
    userName: '张三',
    startTime: '2025-01-26 09:00:00',
    endTime: '2025-01-26 12:00:00',
    status: 'approved',
  },
  {
    id: 'BK002',
    equipmentName: '离心机',
    userName: '李四',
    startTime: '2025-01-26 14:00:00',
    endTime: '2025-01-26 16:00:00',
    status: 'pending',
  },
]

const LabManagement: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [labStats, setLabStats] = useState<LabStats>(mockLabStats)
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>(
    mockEquipmentStatus
  )
  const [supplyStatus, setSupplyStatus] = useState<SupplyStatus[]>(
    mockSupplyStatus
  )
  const [bookingStatus, setBookingStatus] = useState<BookingStatus[]>(
    mockBookingStatus
  )

  useEffect(() => {
    loadLabData()
  }, [])

  /**
   * 加载实验室数据
   */
  const loadLabData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLabStats(mockLabStats)
      setEquipmentStatus(mockEquipmentStatus)
      setSupplyStatus(mockSupplyStatus)
      setBookingStatus(mockBookingStatus)
    } catch (error) {
      toast.error('加载实验室数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取状态颜色
   * @param status 状态
   * @returns 颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'approved':
        return 'success'
      case 'maintenance':
      case 'low_stock':
      case 'pending':
        return 'warning'
      case 'fault':
      case 'expired':
      case 'out_of_stock':
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  /**
   * 获取状态文本
   * @param status 状态
   * @returns 状态文本
   */
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      normal: '正常',
      maintenance: '维护中',
      fault: '故障',
      offline: '离线',
      low_stock: '库存不足',
      expired: '已过期',
      out_of_stock: '缺货',
      pending: '待审核',
      approved: '已批准',
      rejected: '已拒绝',
    }
    return statusMap[status] || status
  }

  /**
   * 设备表格列配置
   */
  const equipmentColumns = [
    {
      key: 'name',
      title: '设备名称',
      dataIndex: 'name',
    },
    {
      key: 'location',
      title: '位置',
      dataIndex: 'location',
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Badge variant={getStatusColor(status) === 'success' ? 'default' : getStatusColor(status) === 'warning' ? 'secondary' : 'destructive'}>
          {getStatusText(status)}
        </Badge>
      ),
    },
    {
      key: 'lastMaintenance',
      title: '上次维护',
      dataIndex: 'lastMaintenance',
    },
  ]

  /**
   * 耗材表格列配置
   */
  const supplyColumns = [
    {
      key: 'name',
      title: '耗材名称',
      dataIndex: 'name',
    },
    {
      key: 'stock',
      title: '库存',
      dataIndex: 'currentStock',
      render: (currentStock: number, record: SupplyStatus) => (
        <span>
          {currentStock}/{record.minStock}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Badge variant={getStatusColor(status) === 'success' ? 'default' : getStatusColor(status) === 'warning' ? 'secondary' : 'destructive'}>
          {getStatusText(status)}
        </Badge>
      ),
    },
    {
      key: 'expiryDate',
      title: '过期日期',
      dataIndex: 'expiryDate',
    },
  ]

  /**
   * 预约表格列配置
   */
  const bookingColumns = [
    {
      key: 'equipmentName',
      title: '设备名称',
      dataIndex: 'equipmentName',
    },
    {
      key: 'userName',
      title: '预约人',
      dataIndex: 'userName',
    },
    {
      key: 'time',
      title: '预约时间',
      dataIndex: 'startTime',
      render: (startTime: string, record: BookingStatus) => (
        <span>
          {startTime.split(' ')[1]} - {record.endTime.split(' ')[1]}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Badge variant={getStatusColor(status) === 'success' ? 'default' : getStatusColor(status) === 'warning' ? 'secondary' : 'destructive'}>
          {getStatusText(status)}
        </Badge>
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>实验室管理</h1>
        <p className='text-gray-600 mt-1'>综合管理实验室设备、耗材和预约</p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>设备总数</CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{labStats.totalEquipment}台</div>
            <div className='mt-2'>
              <Progress
                value={Math.round(
                  (labStats.normalEquipment / labStats.totalEquipment) * 100
                )}
                className='h-2'
              />
              <div className='text-xs text-gray-500 mt-1'>
                正常: {labStats.normalEquipment} | 维护: {labStats.maintenanceEquipment} | 故障: {labStats.faultEquipment}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>耗材种类</CardTitle>
            <FlaskConical className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{labStats.totalSupplies}种</div>
            <div className='mt-2'>
              <div className='flex justify-between text-xs'>
                <span className='text-red-500'>库存不足: {labStats.lowStockSupplies}</span>
                <span className='text-orange-500'>已过期: {labStats.expiredSupplies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>今日预约</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{labStats.todayBookings}个</div>
            <div className='mt-2'>
              <div className='flex justify-between text-xs'>
                <span className='text-green-500'>已批准: {labStats.approvedBookings}</span>
                <span className='text-yellow-500'>待审核: {labStats.pendingBookings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <Button
                onClick={() => navigate('/lab/supplies')}
                className='w-full'
              >
                <ShoppingCart className='mr-2 h-4 w-4' />
                耗材采购
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 警告信息 */}
      {(labStats.faultEquipment > 0 || labStats.lowStockSupplies > 0 || labStats.expiredSupplies > 0) && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start space-x-3'>
              <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-yellow-800'>实验室状态警告</h3>
                <div className='mt-2 text-sm text-yellow-700'>
                  {labStats.faultEquipment > 0 && (
                    <div>• {labStats.faultEquipment} 台设备故障，需要维修</div>
                  )}
                  {labStats.lowStockSupplies > 0 && (
                    <div>• {labStats.lowStockSupplies} 种耗材库存不足，需要补充</div>
                  )}
                  {labStats.expiredSupplies > 0 && (
                    <div>• {labStats.expiredSupplies} 种耗材已过期，需要更换</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细信息标签页 */}
      <Card>
        <Tabs defaultValue='equipment'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='equipment'>设备状态</TabsTrigger>
            <TabsTrigger value='supplies'>耗材库存</TabsTrigger>
            <TabsTrigger value='bookings'>今日预约</TabsTrigger>
          </TabsList>
          <TabsContent value='equipment' className='mt-6'>
            <div className='mb-4 flex justify-between items-center'>
              <h3 className='text-lg font-medium'>设备状态概览</h3>
              <Button onClick={() => navigate('/lab/equipment')}>
                管理设备
              </Button>
            </div>
            <DataTable
              columns={equipmentColumns}
              dataSource={equipmentStatus}
              loading={loading}
              pagination={false}
            />
          </TabsContent>
          <TabsContent value='supplies' className='mt-6'>
            <div className='mb-4 flex justify-between items-center'>
              <h3 className='text-lg font-medium'>耗材库存状态</h3>
              <Button onClick={() => navigate('/lab/supplies')}>
                管理耗材
              </Button>
            </div>
            <DataTable
              columns={supplyColumns}
              dataSource={supplyStatus}
              loading={loading}
              pagination={false}
            />
          </TabsContent>
          <TabsContent value='bookings' className='mt-6'>
            <div className='mb-4 flex justify-between items-center'>
              <h3 className='text-lg font-medium'>今日预约安排</h3>
              <Button onClick={() => navigate('/lab/booking')}>
                管理预约
              </Button>
            </div>
            <DataTable
              columns={bookingColumns}
              dataSource={bookingStatus}
              loading={loading}
              pagination={false}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default LabManagement
