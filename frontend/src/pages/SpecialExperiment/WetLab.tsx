/**
 * 湿实验管理页面
 * 管理特检实验中的湿实验流程
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
  User,
  TestTube,
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

// 湿实验状态类型
type WetLabStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'

// 实验类型
type ExperimentType =
  | 'pcr'
  | 'sequencing'
  | 'culture'
  | 'extraction'
  | 'purification'
  | 'other'

// 湿实验数据接口
interface WetLabExperiment {
  id: string
  sampleId: string
  experimentType: ExperimentType
  status: WetLabStatus
  title: string
  description: string
  operator: string
  startTime: string
  endTime?: string
  estimatedDuration: number // 预计时长（小时）
  actualDuration?: number // 实际时长（小时）
  reagents: string[]
  equipment: string[]
  protocol: string
  notes?: string
  results?: string
  createdAt: string
  updatedAt: string
}

// 模拟湿实验数据
const mockWetLabExperiments: WetLabExperiment[] = [
  {
    id: 'WL001',
    sampleId: 'S001',
    experimentType: 'pcr',
    status: 'in_progress',
    title: 'PCR扩增实验',
    description: '对样本进行PCR扩增检测',
    operator: '张三',
    startTime: '2025-01-15 09:00:00',
    estimatedDuration: 4,
    reagents: ['PCR Mix', 'dNTPs', '引物'],
    equipment: ['PCR仪', '离心机', '移液器'],
    protocol: 'PCR-001',
    createdAt: '2025-01-15 08:30:00',
    updatedAt: '2025-01-15 09:00:00',
  },
  {
    id: 'WL002',
    sampleId: 'S002',
    experimentType: 'extraction',
    status: 'completed',
    title: 'DNA提取实验',
    description: '从样本中提取DNA',
    operator: '李四',
    startTime: '2025-01-14 14:00:00',
    endTime: '2025-01-14 16:30:00',
    estimatedDuration: 2,
    actualDuration: 2.5,
    reagents: ['裂解液', '蛋白酶K', '乙醇'],
    equipment: ['离心机', '水浴锅', '移液器'],
    protocol: 'DNA-EXT-001',
    results: 'DNA浓度: 150ng/μL, 纯度: 1.8',
    createdAt: '2025-01-14 13:30:00',
    updatedAt: '2025-01-14 16:30:00',
  },
]

/**
 * 获取实验状态显示样式
 */
const getStatusBadge = (status: WetLabStatus) => {
  const statusConfig = {
    pending: {
      label: '待开始',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800',
    },
    in_progress: {
      label: '进行中',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800',
    },
    completed: {
      label: '已完成',
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800',
    },
    failed: {
      label: '失败',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800',
    },
    cancelled: {
      label: '已取消',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-600',
    },
  }

  const config = statusConfig[status] || {
    label: '未知',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800',
  }

  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取实验类型显示文本
 */
const getExperimentTypeText = (type: ExperimentType) => {
  const typeMap = {
    pcr: 'PCR扩增',
    sequencing: '测序实验',
    culture: '细胞培养',
    extraction: 'DNA/RNA提取',
    purification: '纯化实验',
    other: '其他实验',
  }
  return typeMap[type]
}

export default function WetLab() {
  const [experiments, setExperiments] = useState<WetLabExperiment[]>(
    mockWetLabExperiments
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedExperiment, setSelectedExperiment] =
    useState<WetLabExperiment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 过滤实验数据
  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch =
      experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || experiment.status === statusFilter
    const matchesType =
      typeFilter === 'all' || experiment.experimentType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // 表格列配置
  const columns = [
    {
      key: 'id',
      title: '实验编号',
      width: '100px',
    },
    {
      key: 'sampleId',
      title: '样本编号',
      width: '100px',
    },
    {
      key: 'title',
      title: '实验标题',
      width: '200px',
    },
    {
      key: 'experimentType',
      title: '实验类型',
      width: '120px',
      render: (value: ExperimentType) => getExperimentTypeText(value),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value: WetLabStatus) => getStatusBadge(value),
    },
    {
      key: 'operator',
      title: '操作员',
      width: '100px',
    },
    {
      key: 'startTime',
      title: '开始时间',
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
      render: (_: any, record: WetLabExperiment) => (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleViewExperiment(record)}
          >
            <Eye className='h-4 w-4 mr-1' />
            查看
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleEditExperiment(record)}
            disabled={
              record.status === 'completed' || record.status === 'cancelled'
            }
          >
            <Edit className='h-4 w-4 mr-1' />
            编辑
          </Button>
        </div>
      ),
    },
  ]

  /**
   * 查看实验详情
   */
  const handleViewExperiment = (experiment: WetLabExperiment) => {
    setSelectedExperiment(experiment)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  /**
   * 编辑实验
   */
  const handleEditExperiment = (experiment: WetLabExperiment) => {
    setSelectedExperiment(experiment)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 新建实验
   */
  const handleCreateExperiment = () => {
    const newExperiment: WetLabExperiment = {
      id: '',
      sampleId: '',
      experimentType: 'pcr',
      status: 'pending',
      title: '',
      description: '',
      operator: '',
      startTime: '',
      estimatedDuration: 1,
      reagents: [],
      equipment: [],
      protocol: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedExperiment(newExperiment)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 保存实验
   */
  const handleSaveExperiment = () => {
    if (!selectedExperiment) return

    if (selectedExperiment.id) {
      // 更新现有实验
      setExperiments(prev =>
        prev.map(exp =>
          exp.id === selectedExperiment.id
            ? { ...selectedExperiment, updatedAt: new Date().toISOString() }
            : exp
        )
      )
      toast.success('实验信息已更新')
    } else {
      // 创建新实验
      const newId = `WL${String(experiments.length + 1).padStart(3, '0')}`
      const newExperiment = {
        ...selectedExperiment,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setExperiments(prev => [...prev, newExperiment])
      toast.success('实验已创建')
    }

    setIsDialogOpen(false)
    setSelectedExperiment(null)
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>湿实验管理</h1>
          <p className='text-gray-600 mt-1'>管理特检实验中的湿实验流程</p>
        </div>
        <Button onClick={handleCreateExperiment}>
          <Plus className='h-4 w-4 mr-2' />
          新建实验
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              总实验数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {experiments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {experiments.filter(e => e.status === 'in_progress').length}
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
            <div className='text-2xl font-bold text-green-600'>
              {experiments.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              待开始
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>
              {experiments.filter(e => e.status === 'pending').length}
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
                  placeholder='搜索实验标题、样本编号或操作员...'
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
                  <SelectItem value='pending'>待开始</SelectItem>
                  <SelectItem value='in_progress'>进行中</SelectItem>
                  <SelectItem value='completed'>已完成</SelectItem>
                  <SelectItem value='failed'>失败</SelectItem>
                  <SelectItem value='cancelled'>已取消</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='类型' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部类型</SelectItem>
                  <SelectItem value='pcr'>PCR扩增</SelectItem>
                  <SelectItem value='sequencing'>测序实验</SelectItem>
                  <SelectItem value='culture'>细胞培养</SelectItem>
                  <SelectItem value='extraction'>DNA/RNA提取</SelectItem>
                  <SelectItem value='purification'>纯化实验</SelectItem>
                  <SelectItem value='other'>其他实验</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实验列表 */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            dataSource={filteredExperiments}
            columns={columns}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredExperiments.length,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </CardContent>
      </Card>

      {/* 实验详情/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? selectedExperiment?.id
                  ? '编辑实验'
                  : '新建实验'
                : '实验详情'}
            </DialogTitle>
          </DialogHeader>
          {selectedExperiment && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>实验编号</Label>
                  <Input
                    value={selectedExperiment.id}
                    disabled
                    placeholder='系统自动生成'
                  />
                </div>
                <div>
                  <Label>样本编号</Label>
                  <Input
                    value={selectedExperiment.sampleId}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        sampleId: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>实验标题</Label>
                  <Input
                    value={selectedExperiment.title}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        title: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>实验类型</Label>
                  <Select
                    value={selectedExperiment.experimentType}
                    onValueChange={(value: ExperimentType) =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        experimentType: value,
                      })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='pcr'>PCR扩增</SelectItem>
                      <SelectItem value='sequencing'>测序实验</SelectItem>
                      <SelectItem value='culture'>细胞培养</SelectItem>
                      <SelectItem value='extraction'>DNA/RNA提取</SelectItem>
                      <SelectItem value='purification'>纯化实验</SelectItem>
                      <SelectItem value='other'>其他实验</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>操作员</Label>
                  <Input
                    value={selectedExperiment.operator}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        operator: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>预计时长（小时）</Label>
                  <Input
                    type='number'
                    value={selectedExperiment.estimatedDuration}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        estimatedDuration: Number(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label>实验描述</Label>
                <Textarea
                  value={selectedExperiment.description}
                  onChange={e =>
                    setSelectedExperiment({
                      ...selectedExperiment,
                      description: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div>
                <Label>实验方案</Label>
                <Input
                  value={selectedExperiment.protocol}
                  onChange={e =>
                    setSelectedExperiment({
                      ...selectedExperiment,
                      protocol: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder='实验方案编号或名称'
                />
              </div>
              {selectedExperiment.results && (
                <div>
                  <Label>实验结果</Label>
                  <Textarea
                    value={selectedExperiment.results}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
                        results: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              )}
              {selectedExperiment.notes && (
                <div>
                  <Label>备注</Label>
                  <Textarea
                    value={selectedExperiment.notes}
                    onChange={e =>
                      setSelectedExperiment({
                        ...selectedExperiment,
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
                  <Button onClick={handleSaveExperiment}>保存</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
