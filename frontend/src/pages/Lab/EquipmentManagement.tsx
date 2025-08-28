/**
 * 设备管理页面
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
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
  Wrench,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import FormBuilder from '../../components/FormBuilder'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 设备数据接口
interface Equipment {
  id: string
  name: string
  model: string
  serialNumber: string
  category: string
  status: 'normal' | 'maintenance' | 'fault' | 'offline'
  location: string
  purchaseDate: string
  warrantyExpiry: string
  lastMaintenance: string
  nextMaintenance: string
  responsible: string
  description: string
  createdAt: string
  updatedAt: string
}

// 维护记录接口
interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'routine' | 'repair' | 'calibration' | 'upgrade'
  description: string
  technician: string
  startTime: string
  endTime: string
  cost: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
  createdAt: string
}

// 设备状态配置
const equipmentStatusConfig = {
  normal: { label: '正常', color: 'success' },
  maintenance: { label: '维护中', color: 'warning' },
  fault: { label: '故障', color: 'error' },
  offline: { label: '离线', color: 'default' },
}

// 维护类型配置
const maintenanceTypeConfig = {
  routine: { label: '例行维护', color: 'blue' },
  repair: { label: '故障维修', color: 'red' },
  calibration: { label: '校准检定', color: 'green' },
  upgrade: { label: '升级改造', color: 'purple' },
}

// 维护状态配置
const maintenanceStatusConfig = {
  pending: { label: '待处理', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'error' },
}

// 模拟设备数据
const mockEquipmentData: Equipment[] = [
  {
    id: 'EQ001',
    name: 'PCR扩增仪',
    model: 'ABI 7500',
    serialNumber: 'SN20240001',
    category: '分子生物学设备',
    status: 'normal',
    location: '分子实验室A',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    lastMaintenance: '2024-12-01',
    nextMaintenance: '2025-03-01',
    responsible: '张三',
    description: '用于基因扩增和定量检测',
    createdAt: '2023-01-15 10:00:00',
    updatedAt: '2024-12-01 14:30:00',
  },
  {
    id: 'EQ002',
    name: '离心机',
    model: 'Eppendorf 5424R',
    serialNumber: 'SN20240002',
    category: '通用设备',
    status: 'maintenance',
    location: '准备间',
    purchaseDate: '2023-03-20',
    warrantyExpiry: '2026-03-20',
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2025-02-15',
    responsible: '李四',
    description: '高速冷冻离心机',
    createdAt: '2023-03-20 09:15:00',
    updatedAt: '2024-11-15 16:45:00',
  },
]

// 模拟维护记录数据
const mockMaintenanceData: MaintenanceRecord[] = [
  {
    id: 'MR001',
    equipmentId: 'EQ001',
    equipmentName: 'PCR扩增仪',
    type: 'routine',
    description: '例行维护保养',
    technician: '王工程师',
    startTime: '2024-12-01 09:00:00',
    endTime: '2024-12-01 11:30:00',
    cost: 500,
    status: 'completed',
    notes: '清洁设备，更换滤芯，校准温度',
    createdAt: '2024-12-01 09:00:00',
  },
  {
    id: 'MR002',
    equipmentId: 'EQ002',
    equipmentName: '离心机',
    type: 'repair',
    description: '转子异响维修',
    technician: '赵工程师',
    startTime: '2024-11-15 14:00:00',
    endTime: '2024-11-15 17:00:00',
    cost: 1200,
    status: 'completed',
    notes: '更换转子轴承，调整平衡',
    createdAt: '2024-11-15 14:00:00',
  },
]

const EquipmentManagement: React.FC = () => {
  const [equipmentData, setEquipmentData] =
    useState<Equipment[]>(mockEquipmentData)
  const [maintenanceData, setMaintenanceData] =
    useState<MaintenanceRecord[]>(mockMaintenanceData)
  const [loading, setLoading] = useState(false)
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false)
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(
    null
  )
  const [currentMaintenance, setMaintenanceRecord] =
    useState<MaintenanceRecord | null>(null)
  const [formData, setFormData] = useState<Partial<Equipment>>({})
  const [maintenanceFormData, setMaintenanceFormData] = useState<Partial<MaintenanceRecord>>({})
  const [activeTab, setActiveTab] = useState('equipment')

  // 获取状态徽章
  const getStatusBadge = (status: string, config: any) => {
    const statusInfo = config[status] || { label: status, color: 'default' }
    return <Badge status={statusInfo.color as any} text={statusInfo.label} />
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

  // 加载维护记录数据
  const loadMaintenanceData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMaintenanceData(mockMaintenanceData)
    } catch (error) {
      toast.error('加载维护记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理设备操作
  const handleEquipmentView = (record: Equipment) => {
    setCurrentEquipment(record)
    setFormData(record)
    setEquipmentModalVisible(true)
  }

  const handleEquipmentEdit = (record: Equipment) => {
    setCurrentEquipment(record)
    setFormData(record)
    setEquipmentModalVisible(true)
  }

  const handleEquipmentDelete = (record: Equipment) => {
    if (window.confirm(`确定要删除设备 "${record.name}" 吗？`)) {
      setEquipmentData(prev => prev.filter(item => item.id !== record.id))
      toast.success('设备删除成功')
    }
  }

  const handleEquipmentMaintenance = (record: Equipment) => {
    setCurrentEquipment(record)
    setMaintenanceFormData({
      equipmentId: record.id,
      equipmentName: record.name,
    })
    setMaintenanceModalVisible(true)
  }

  // 处理维护记录操作
  const handleMaintenanceView = (record: MaintenanceRecord) => {
    setMaintenanceRecord(record)
    setMaintenanceFormData(record)
    setMaintenanceModalVisible(true)
  }

  const handleMaintenanceEdit = (record: MaintenanceRecord) => {
    setMaintenanceRecord(record)
    setMaintenanceFormData(record)
    setMaintenanceModalVisible(true)
  }

  // 保存设备
  const handleEquipmentSave = async () => {
    try {
      // 简单验证必填字段
      if (!formData.name || !formData.model || !formData.serialNumber) {
        toast.error('请填写所有必填字段')
        return
      }
      
      if (currentEquipment) {
        // 编辑设备
        setEquipmentData(prev =>
          prev.map(item =>
            item.id === currentEquipment.id
              ? { ...item, ...formData, updatedAt: new Date().toLocaleString() }
              : item
          )
        )
        toast.success('设备更新成功')
      } else {
        // 新增设备
        const newEquipment: Equipment = {
          ...formData as Equipment,
          id: `EQ${String(equipmentData.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }
        setEquipmentData(prev => [...prev, newEquipment])
        toast.success('设备添加成功')
      }
      setEquipmentModalVisible(false)
      setCurrentEquipment(null)
      setFormData({})
    } catch (error) {
      console.error('保存设备失败:', error)
    }
  }

  // 保存维护记录
  const handleMaintenanceSave = async () => {
    try {
      // 简单验证必填字段
      if (!maintenanceFormData.equipmentId || !maintenanceFormData.type || !maintenanceFormData.description) {
        toast.error('请填写所有必填字段')
        return
      }
      
      if (currentMaintenance) {
        // 编辑维护记录
        setMaintenanceData(prev =>
          prev.map(item =>
            item.id === currentMaintenance.id ? { ...item, ...maintenanceFormData } : item
          )
        )
        toast.success('维护记录更新成功')
      } else {
        // 新增维护记录
        const newRecord: MaintenanceRecord = {
          ...maintenanceFormData as MaintenanceRecord,
          id: `MR${String(maintenanceData.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toLocaleString(),
        }
        setMaintenanceData(prev => [...prev, newRecord])
        toast.success('维护记录添加成功')
      }
      setMaintenanceModalVisible(false)
      setMaintenanceRecord(null)
      setMaintenanceFormData({})
    } catch (error) {
      console.error('保存维护记录失败:', error)
    }
  }

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
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status, equipmentStatusConfig),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 100,
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: Equipment) => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleEquipmentView(record)}
          >
            <Eye className='w-4 h-4 mr-1' />
            查看
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleEquipmentEdit(record)}
          >
            <Edit className='w-4 h-4 mr-1' />
            编辑
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleEquipmentMaintenance(record)}
          >
            <Wrench className='w-4 h-4 mr-1' />
            维护
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleEquipmentDelete(record)}
          >
            <Trash2 className='w-4 h-4 mr-1' />
            删除
          </Button>
        </div>
      ),
    },
  ]

  // 维护记录表格列配置
  const maintenanceColumns = [
    {
      title: '记录编号',
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
      title: '维护类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => getStatusBadge(type, maintenanceTypeConfig),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '技术员',
      dataIndex: 'technician',
      key: 'technician',
      width: 100,
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
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => `¥${cost}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) =>
        getStatusBadge(status, maintenanceStatusConfig),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: MaintenanceRecord) => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleMaintenanceView(record)}
          >
            <Eye className='w-4 h-4 mr-1' />
            查看
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleMaintenanceEdit(record)}
          >
            <Edit className='w-4 h-4 mr-1' />
            编辑
          </Button>
        </div>
      ),
    },
  ]

  // 设备表格操作配置
  const equipmentTableActions = {
    showAdd: true,
    addText: '新增设备',
    onAdd: () => {
      setCurrentEquipment(null)
      setFormData({})
      setEquipmentModalVisible(true)
    },
  }

  // 维护记录表格操作配置
  const maintenanceTableActions = {
    showAdd: true,
    addText: '新增维护记录',
    onAdd: () => {
      setMaintenanceRecord(null)
      setMaintenanceFormData({})
      setMaintenanceModalVisible(true)
    },
  }

  // 设备表单配置
  const equipmentFormFields = [
    {
      name: 'name',
      label: '设备名称',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入设备名称' }],
    },
    {
      name: 'model',
      label: '设备型号',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入设备型号' }],
    },
    {
      name: 'serialNumber',
      label: '序列号',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入序列号' }],
    },
    {
      name: 'category',
      label: '设备类别',
      type: 'select',
      required: true,
      options: [
        { label: '分子生物学设备', value: '分子生物学设备' },
        { label: '通用设备', value: '通用设备' },
        { label: '分析仪器', value: '分析仪器' },
        { label: '样品处理设备', value: '样品处理设备' },
      ],
      rules: [{ required: true, message: '请选择设备类别' }],
    },
    {
      name: 'status',
      label: '设备状态',
      type: 'select',
      required: true,
      options: [
        { label: '正常', value: 'normal' },
        { label: '维护中', value: 'maintenance' },
        { label: '故障', value: 'fault' },
        { label: '离线', value: 'offline' },
      ],
      rules: [{ required: true, message: '请选择设备状态' }],
    },
    {
      name: 'location',
      label: '设备位置',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入设备位置' }],
    },
    {
      name: 'responsible',
      label: '负责人',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入负责人' }],
    },
    {
      name: 'purchaseDate',
      label: '购买日期',
      type: 'date',
      required: true,
      rules: [{ required: true, message: '请选择购买日期' }],
    },
    {
      name: 'warrantyExpiry',
      label: '保修到期',
      type: 'date',
      required: true,
      rules: [{ required: true, message: '请选择保修到期日期' }],
    },
    {
      name: 'nextMaintenance',
      label: '下次维护',
      type: 'date',
      required: true,
      rules: [{ required: true, message: '请选择下次维护日期' }],
    },
    {
      name: 'description',
      label: '设备描述',
      type: 'textarea',
      span: 24,
    },
  ]

  // 维护记录表单配置
  const maintenanceFormFields = [
    {
      name: 'equipmentName',
      label: '设备名称',
      type: 'input',
      required: true,
      disabled: true,
    },
    {
      name: 'type',
      label: '维护类型',
      type: 'select',
      required: true,
      options: [
        { label: '例行维护', value: 'routine' },
        { label: '故障维修', value: 'repair' },
        { label: '校准检定', value: 'calibration' },
        { label: '升级改造', value: 'upgrade' },
      ],
      rules: [{ required: true, message: '请选择维护类型' }],
    },
    {
      name: 'technician',
      label: '技术员',
      type: 'input',
      required: true,
      rules: [{ required: true, message: '请输入技术员' }],
    },
    {
      name: 'startTime',
      label: '开始时间',
      type: 'datetime',
      required: true,
      rules: [{ required: true, message: '请选择开始时间' }],
    },
    {
      name: 'endTime',
      label: '结束时间',
      type: 'datetime',
    },
    {
      name: 'cost',
      label: '维护费用',
      type: 'number',
      required: true,
      rules: [{ required: true, message: '请输入维护费用' }],
    },
    {
      name: 'status',
      label: '维护状态',
      type: 'select',
      required: true,
      options: [
        { label: '待处理', value: 'pending' },
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' },
      ],
      rules: [{ required: true, message: '请选择维护状态' }],
    },
    {
      name: 'description',
      label: '维护描述',
      type: 'textarea',
      span: 24,
      required: true,
      rules: [{ required: true, message: '请输入维护描述' }],
    },
    {
      name: 'notes',
      label: '备注',
      type: 'textarea',
      span: 24,
    },
  ]

  useEffect(() => {
    if (activeTab === 'equipment') {
      loadEquipmentData()
    } else if (activeTab === 'maintenance') {
      loadMaintenanceData()
    }
  }, [activeTab])

  // 统计数据
  const equipmentStats = {
    total: equipmentData.length,
    normal: equipmentData.filter(item => item.status === 'normal').length,
    maintenance: equipmentData.filter(item => item.status === 'maintenance')
      .length,
    fault: equipmentData.filter(item => item.status === 'fault').length,
  }

  const maintenanceStats = {
    total: maintenanceData.length,
    pending: maintenanceData.filter(item => item.status === 'pending').length,
    in_progress: maintenanceData.filter(item => item.status === 'in_progress')
      .length,
    completed: maintenanceData.filter(item => item.status === 'completed')
      .length,
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>设备管理</h1>
        <p className='text-gray-600 mt-1'>管理实验室设备和维护记录</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equipment">设备管理</TabsTrigger>
          <TabsTrigger value="maintenance">维护记录</TabsTrigger>
        </TabsList>
        
        <TabsContent value="equipment">
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
                  {equipmentStats.normal}
                </div>
                <div className='text-gray-500 text-sm'>正常设备</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {equipmentStats.maintenance}
                </div>
                <div className='text-gray-500 text-sm'>维护中</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {equipmentStats.fault}
                </div>
                <div className='text-gray-500 text-sm'>故障设备</div>
              </div>
            </Card>
          </div>

          {/* 设备列表 */}
          <DataTable
            columns={equipmentColumns}
            dataSource={equipmentData}
            loading={loading}
            actions={equipmentTableActions}
            rowKey='id'
          />
        </TabsContent>

        <TabsContent value="maintenance">
          {/* 维护统计卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {maintenanceStats.total}
                </div>
                <div className='text-gray-500 text-sm'>维护记录</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {maintenanceStats.pending}
                </div>
                <div className='text-gray-500 text-sm'>待处理</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {maintenanceStats.in_progress}
                </div>
                <div className='text-gray-500 text-sm'>进行中</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {maintenanceStats.completed}
                </div>
                <div className='text-gray-500 text-sm'>已完成</div>
              </div>
            </Card>
          </div>

          {/* 维护记录列表 */}
          <DataTable
            columns={maintenanceColumns}
            dataSource={maintenanceData}
            loading={loading}
            actions={maintenanceTableActions}
            rowKey='id'
          />
        </TabsContent>
      </Tabs>

      {/* 设备模态框 */}
      <Modal
        title={currentEquipment ? '编辑设备' : '新增设备'}
        open={equipmentModalVisible}
        onClose={() => {
          setEquipmentModalVisible(false)
          setCurrentEquipment(null)
          setFormData({})
        }}
        onOk={handleEquipmentSave}
        showFooter={true}
        destroyOnClose
      >
        <FormBuilder
          fields={equipmentFormFields}
          initialValues={formData}
          onValuesChange={(_, allValues) => setFormData(allValues)}
        />
      </Modal>

      {/* 维护记录模态框 */}
      <Modal
        title={currentMaintenance ? '编辑维护记录' : '新增维护记录'}
        open={maintenanceModalVisible}
        onClose={() => {
          setMaintenanceModalVisible(false)
          setMaintenanceRecord(null)
          setMaintenanceFormData({})
        }}
        onOk={handleMaintenanceSave}
        showFooter={true}
        destroyOnClose
      >
        <FormBuilder
          fields={maintenanceFormFields}
          initialValues={maintenanceFormData}
          onValuesChange={(_, allValues) => setMaintenanceFormData(allValues)}
        />
      </Modal>
    </div>
  )
}

export default EquipmentManagement
