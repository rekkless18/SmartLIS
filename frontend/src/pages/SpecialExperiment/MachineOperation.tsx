/**
 * 上机管理页面
 * 管理特检实验中的设备上机操作
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Settings,
  AlertCircle,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { toast } from 'sonner'

// 上机状态类型
type MachineStatus =
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'maintenance'

// 设备类型
type MachineType =
  | 'sequencer'
  | 'mass_spec'
  | 'pcr'
  | 'microscope'
  | 'centrifuge'
  | 'other'

// 上机操作数据接口
interface MachineOperation {
  id: string
  machineId: string
  machineName: string
  machineType: MachineType
  sampleId: string
  experimentId: string
  status: MachineStatus
  operator: string
  scheduledTime: string
  startTime?: string
  endTime?: string
  estimatedDuration: number // 预计时长（小时）
  actualDuration?: number // 实际时长（小时）
  protocol: string
  parameters: Record<string, any>
  notes?: string
  results?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

// 模拟上机操作数据
const mockMachineOperations: MachineOperation[] = [
  {
    id: 'MO001',
    machineId: 'SEQ001',
    machineName: 'Illumina NovaSeq 6000',
    machineType: 'sequencer',
    sampleId: 'S001',
    experimentId: 'EXP001',
    status: 'running',
    operator: '张三',
    scheduledTime: '2025-01-15 09:00:00',
    startTime: '2025-01-15 09:15:00',
    estimatedDuration: 8,
    protocol: 'WGS-Standard',
    parameters: {
      readLength: 150,
      coverage: '30X',
      indexType: 'dual',
    },
    createdAt: '2025-01-14 16:00:00',
    updatedAt: '2025-01-15 09:15:00',
  },
  {
    id: 'MO002',
    machineId: 'MS001',
    machineName: 'Thermo Q Exactive',
    machineType: 'mass_spec',
    sampleId: 'S002',
    experimentId: 'EXP002',
    status: 'completed',
    operator: '李四',
    scheduledTime: '2025-01-14 14:00:00',
    startTime: '2025-01-14 14:10:00',
    endTime: '2025-01-14 16:30:00',
    estimatedDuration: 2,
    actualDuration: 2.3,
    protocol: 'Proteomics-DDA',
    parameters: {
      resolution: 70000,
      scanRange: '300-1800',
      collisionEnergy: 'HCD 27',
    },
    results: '检测到1245个蛋白质，数据质量良好',
    createdAt: '2025-01-14 10:00:00',
    updatedAt: '2025-01-14 16:30:00',
  },
]

/**
 * 获取上机状态显示样式
 */
const getStatusBadge = (status: MachineStatus) => {
  const statusConfig = {
    scheduled: { label: '已预约', className: 'bg-blue-100 text-blue-800' },
    running: { label: '运行中', className: 'bg-green-100 text-green-800' },
    completed: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
    failed: { label: '失败', className: 'bg-red-100 text-red-800' },
    cancelled: { label: '已取消', className: 'bg-yellow-100 text-yellow-800' },
    maintenance: {
      label: '维护中',
      className: 'bg-orange-100 text-orange-800',
    },
  }

  const config = statusConfig[status] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }

  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取设备类型显示文本
 */
const getMachineTypeText = (type: MachineType) => {
  const typeMap = {
    sequencer: '测序仪',
    mass_spec: '质谱仪',
    pcr: 'PCR仪',
    microscope: '显微镜',
    centrifuge: '离心机',
    other: '其他设备',
  }
  return typeMap[type]
}

export default function MachineOperation() {
  const [operations, setOperations] = useState<MachineOperation[]>(
    mockMachineOperations
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [machineFilter, setMachineFilter] = useState<string>('all')
  const [selectedOperation, setSelectedOperation] =
    useState<MachineOperation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 过滤操作数据
  const filteredOperations = operations.filter(operation => {
    const matchesSearch =
      operation.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || operation.status === statusFilter
    const matchesMachine =
      machineFilter === 'all' || operation.machineType === machineFilter

    return matchesSearch && matchesStatus && matchesMachine
  })

  // 表格列配置
  const columns = [
    {
      key: 'id',
      title: '操作编号',
      width: '100px',
    },
    {
      key: 'machineName',
      title: '设备名称',
      width: '200px',
    },
    {
      key: 'machineType',
      title: '设备类型',
      width: '100px',
      render: (value: MachineType) => getMachineTypeText(value),
    },
    {
      key: 'sampleId',
      title: '样本编号',
      width: '100px',
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value: MachineStatus) => getStatusBadge(value),
    },
    {
      key: 'operator',
      title: '操作员',
      width: '100px',
    },
    {
      key: 'scheduledTime',
      title: '预约时间',
      width: '150px',
    },
    {
      key: 'estimatedDuration',
      title: '预计时长',
      width: '100px',
      render: (value: number) => `${value}小时`,
    },
    {
      key: 'actions',
      title: '操作',
      width: '200px',
      render: (_: any, record: MachineOperation) => (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleViewOperation(record)}
          >
            <Eye className='h-4 w-4 mr-1' />
            查看
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleEditOperation(record)}
            disabled={
              record.status === 'completed' || record.status === 'cancelled'
            }
          >
            <Edit className='h-4 w-4 mr-1' />
            编辑
          </Button>
          {record.status === 'scheduled' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleStartOperation(record.id)}
            >
              开始
            </Button>
          )}
          {record.status === 'running' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleCompleteOperation(record.id)}
            >
              完成
            </Button>
          )}
        </div>
      ),
    },
  ]

  /**
   * 查看操作详情
   */
  const handleViewOperation = (operation: MachineOperation) => {
    setSelectedOperation(operation)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  /**
   * 编辑操作
   */
  const handleEditOperation = (operation: MachineOperation) => {
    setSelectedOperation(operation)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 新建操作
   */
  const handleCreateOperation = () => {
    const newOperation: MachineOperation = {
      id: '',
      machineId: '',
      machineName: '',
      machineType: 'sequencer',
      sampleId: '',
      experimentId: '',
      status: 'scheduled',
      operator: '',
      scheduledTime: '',
      estimatedDuration: 1,
      protocol: '',
      parameters: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedOperation(newOperation)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 开始操作
   */
  const handleStartOperation = (operationId: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? {
              ...op,
              status: 'running' as MachineStatus,
              startTime: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : op
      )
    )
    toast.success('操作已开始')
  }

  /**
   * 完成操作
   */
  const handleCompleteOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId)
    if (!operation || !operation.startTime) return

    const startTime = new Date(operation.startTime)
    const endTime = new Date()
    const actualDuration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // 小时

    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? {
              ...op,
              status: 'completed' as MachineStatus,
              endTime: endTime.toISOString(),
              actualDuration: Math.round(actualDuration * 100) / 100,
              updatedAt: new Date().toISOString(),
            }
          : op
      )
    )
    toast.success('操作已完成')
  }

  /**
   * 保存操作
   */
  const handleSaveOperation = () => {
    if (!selectedOperation) return

    if (selectedOperation.id) {
      // 更新现有操作
      setOperations(prev =>
        prev.map(op =>
          op.id === selectedOperation.id
            ? { ...selectedOperation, updatedAt: new Date().toISOString() }
            : op
        )
      )
      toast.success('操作信息已更新')
    } else {
      // 创建新操作
      const newId = `MO${String(operations.length + 1).padStart(3, '0')}`
      const newOperation = {
        ...selectedOperation,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setOperations(prev => [...prev, newOperation])
      toast.success('操作已创建')
    }

    setIsDialogOpen(false)
    setSelectedOperation(null)
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>上机管理</h1>
          <p className='text-gray-600 mt-1'>管理特检实验中的设备上机操作</p>
        </div>
        <Button onClick={handleCreateOperation}>
          <Plus className='h-4 w-4 mr-2' />
          新建操作
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              总操作数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {operations.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              运行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {operations.filter(op => op.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>
              {operations.filter(op => op.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              已预约
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {operations.filter(op => op.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='搜索设备名称、样本编号或操作员...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部状态</SelectItem>
                  <SelectItem value='scheduled'>已预约</SelectItem>
                  <SelectItem value='running'>运行中</SelectItem>
                  <SelectItem value='completed'>已完成</SelectItem>
                  <SelectItem value='failed'>失败</SelectItem>
                  <SelectItem value='cancelled'>已取消</SelectItem>
                  <SelectItem value='maintenance'>维护中</SelectItem>
                </SelectContent>
              </Select>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='设备类型' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部设备</SelectItem>
                  <SelectItem value='sequencer'>测序仪</SelectItem>
                  <SelectItem value='mass_spec'>质谱仪</SelectItem>
                  <SelectItem value='pcr'>PCR仪</SelectItem>
                  <SelectItem value='microscope'>显微镜</SelectItem>
                  <SelectItem value='centrifuge'>离心机</SelectItem>
                  <SelectItem value='other'>其他设备</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作列表 */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            data={filteredOperations}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </CardContent>
      </Card>

      {/* 操作详情/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? selectedOperation?.id
                  ? '编辑操作'
                  : '新建操作'
                : '操作详情'}
            </DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>操作编号</Label>
                  <Input
                    value={selectedOperation.id}
                    disabled
                    placeholder='系统自动生成'
                  />
                </div>
                <div>
                  <Label>设备名称</Label>
                  <Input
                    value={selectedOperation.machineName}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        machineName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>设备类型</Label>
                  <Select
                    value={selectedOperation.machineType}
                    onValueChange={(value: MachineType) =>
                      setSelectedOperation({
                        ...selectedOperation,
                        machineType: value,
                      })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='sequencer'>测序仪</SelectItem>
                      <SelectItem value='mass_spec'>质谱仪</SelectItem>
                      <SelectItem value='pcr'>PCR仪</SelectItem>
                      <SelectItem value='microscope'>显微镜</SelectItem>
                      <SelectItem value='centrifuge'>离心机</SelectItem>
                      <SelectItem value='other'>其他设备</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>样本编号</Label>
                  <Input
                    value={selectedOperation.sampleId}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        sampleId: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>实验编号</Label>
                  <Input
                    value={selectedOperation.experimentId}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        experimentId: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>操作员</Label>
                  <Input
                    value={selectedOperation.operator}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        operator: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>预约时间</Label>
                  <Input
                    type='datetime-local'
                    value={
                      selectedOperation.scheduledTime
                        ? new Date(selectedOperation.scheduledTime)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        scheduledTime: new Date(e.target.value).toISOString(),
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>预计时长（小时）</Label>
                  <Input
                    type='number'
                    value={selectedOperation.estimatedDuration}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        estimatedDuration: Number(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label>实验方案</Label>
                <Input
                  value={selectedOperation.protocol}
                  onChange={e =>
                    setSelectedOperation({
                      ...selectedOperation,
                      protocol: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder='实验方案编号或名称'
                />
              </div>
              {selectedOperation.results && (
                <div>
                  <Label>操作结果</Label>
                  <Textarea
                    value={selectedOperation.results}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        results: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              )}
              {selectedOperation.errorMessage && (
                <div>
                  <Label>错误信息</Label>
                  <Textarea
                    value={selectedOperation.errorMessage}
                    disabled
                    rows={2}
                    className='text-red-600'
                  />
                </div>
              )}
              {selectedOperation.notes && (
                <div>
                  <Label>备注</Label>
                  <Textarea
                    value={selectedOperation.notes}
                    onChange={e =>
                      setSelectedOperation({
                        ...selectedOperation,
                        notes: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
              )}
              {isEditing && (
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSaveOperation}>保存</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
