/**
 * 特检异常中心页面
 * 管理特检实验中的所有异常情况
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'
import { toast } from 'sonner'

// 异常状态类型
type ExceptionStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'closed'
  | 'escalated'

// 异常严重程度
type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'

// 异常类型
type ExceptionType =
  | 'wet_lab'
  | 'machine_operation'
  | 'data_analysis'
  | 'quality_control'
  | 'sample_handling'
  | 'other'

// 异常来源
type ExceptionSource = 'wet_lab' | 'machine' | 'analysis' | 'manual'

// 特检异常数据接口
interface SpecialException {
  id: string
  source: ExceptionSource
  sourceId: string // 来源记录ID
  exceptionType: ExceptionType
  severity: ExceptionSeverity
  status: ExceptionStatus
  title: string
  description: string
  sampleId?: string
  experimentId?: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  investigatedBy?: string
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
  rootCause?: string
  preventiveMeasures?: string
  impact: string
  estimatedLoss?: number
  actualLoss?: number
  followUpActions: string[]
  attachments: string[]
  createdAt: string
  updatedAt: string
}

// 模拟特检异常数据
const mockExceptions: SpecialException[] = [
  {
    id: 'SEC001',
    source: 'wet_lab',
    sourceId: 'WL001',
    exceptionType: 'wet_lab',
    severity: 'high',
    status: 'investigating',
    title: 'PCR扩增失败',
    description: 'PCR反应未能成功扩增目标片段，可能影响后续测序分析',
    sampleId: 'S001',
    experimentId: 'EXP001',
    reportedBy: '张三',
    reportedAt: '2025-01-15 10:30:00',
    assignedTo: '李四',
    investigatedBy: '李四',
    impact: '延迟实验进度2天，可能需要重新采样',
    estimatedLoss: 5000,
    followUpActions: ['检查PCR试剂质量', '优化PCR反应条件', '重新设计引物'],
    attachments: ['pcr_gel_image.jpg', 'reaction_conditions.pdf'],
    createdAt: '2025-01-15 10:30:00',
    updatedAt: '2025-01-15 14:30:00',
  },
  {
    id: 'SEC002',
    source: 'machine',
    sourceId: 'MO001',
    exceptionType: 'machine_operation',
    severity: 'critical',
    status: 'resolved',
    title: '测序仪故障',
    description: '测序仪在运行过程中出现硬件故障，导致测序中断',
    sampleId: 'S002',
    experimentId: 'EXP002',
    reportedBy: '王五',
    reportedAt: '2025-01-14 16:00:00',
    assignedTo: '赵六',
    investigatedBy: '赵六',
    resolvedBy: '赵六',
    resolvedAt: '2025-01-15 09:00:00',
    resolution: '更换故障模块，重新校准设备',
    rootCause: '设备老化导致光学模块失效',
    preventiveMeasures: '建立定期维护计划，提前更换易损件',
    impact: '影响3个样本的测序，延迟项目1天',
    estimatedLoss: 15000,
    actualLoss: 12000,
    followUpActions: ['制定设备维护SOP', '采购备用模块', '培训操作人员'],
    attachments: ['fault_report.pdf', 'repair_log.xlsx'],
    createdAt: '2025-01-14 16:00:00',
    updatedAt: '2025-01-15 09:00:00',
  },
  {
    id: 'SEC003',
    source: 'analysis',
    sourceId: 'AI001',
    exceptionType: 'data_analysis',
    severity: 'medium',
    status: 'open',
    title: '数据质量异常',
    description: '基因组测序数据质量评估发现异常，Q30值低于标准要求',
    sampleId: 'S003',
    experimentId: 'EXP003',
    reportedBy: '钱七',
    reportedAt: '2025-01-15 11:00:00',
    assignedTo: '孙八',
    impact: '可能影响变异检测准确性',
    estimatedLoss: 3000,
    followUpActions: ['重新评估数据质量标准', '检查测序流程', '考虑重新测序'],
    attachments: ['quality_report.html'],
    createdAt: '2025-01-15 11:00:00',
    updatedAt: '2025-01-15 11:00:00',
  },
]

/**
 * 获取异常状态显示样式
 */
const getStatusBadge = (status: ExceptionStatus) => {
  const statusConfig = {
    open: {
      label: '待处理',
      variant: 'destructive' as const,
      icon: AlertTriangle,
    },
    investigating: {
      label: '调查中',
      variant: 'default' as const,
      icon: Clock,
    },
    resolved: {
      label: '已解决',
      variant: 'secondary' as const,
      icon: CheckCircle,
    },
    closed: { label: '已关闭', variant: 'outline' as const, icon: XCircle },
    escalated: {
      label: '已升级',
      variant: 'destructive' as const,
      icon: TrendingUp,
    },
  }

  const config = statusConfig[status] || {
    label: '未知',
    variant: 'secondary' as const,
    icon: AlertTriangle,
  }
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className='flex items-center gap-1'>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

/**
 * 获取严重程度显示样式
 */
const getSeverityBadge = (severity: ExceptionSeverity) => {
  const severityConfig = {
    low: { label: '低', className: 'bg-green-100 text-green-800' },
    medium: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
    high: { label: '高', className: 'bg-orange-100 text-orange-800' },
    critical: { label: '紧急', className: 'bg-red-100 text-red-800' },
  }

  const config = severityConfig[severity] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }

  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取异常类型显示文本
 */
const getExceptionTypeText = (type: ExceptionType) => {
  const typeMap = {
    wet_lab: '湿实验异常',
    machine_operation: '设备操作异常',
    data_analysis: '数据分析异常',
    quality_control: '质控异常',
    sample_handling: '样本处理异常',
    other: '其他异常',
  }
  return typeMap[type]
}

/**
 * 获取异常来源显示文本
 */
const getSourceText = (source: ExceptionSource) => {
  const sourceMap = {
    wet_lab: '湿实验',
    machine: '设备操作',
    analysis: '数据分析',
    manual: '手动报告',
  }
  return sourceMap[source]
}

export default function ExceptionCenter() {
  const [exceptions, setExceptions] =
    useState<SpecialException[]>(mockExceptions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedException, setSelectedException] =
    useState<SpecialException | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 过滤异常数据
  const filteredExceptions = exceptions.filter(exception => {
    const matchesSearch =
      exception.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exception.sampleId &&
        exception.sampleId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus =
      statusFilter === 'all' || exception.status === statusFilter
    const matchesSeverity =
      severityFilter === 'all' || exception.severity === severityFilter
    const matchesSource =
      sourceFilter === 'all' || exception.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSeverity && matchesSource
  })

  // 表格列配置
  const columns = [
    {
      key: 'id',
      title: '异常编号',
      width: '100px',
    },
    {
      key: 'title',
      title: '异常标题',
      width: '200px',
    },
    {
      key: 'source',
      title: '来源',
      width: '100px',
      render: (value: ExceptionSource) => getSourceText(value),
    },
    {
      key: 'exceptionType',
      title: '异常类型',
      width: '120px',
      render: (value: ExceptionType) => getExceptionTypeText(value),
    },
    {
      key: 'severity',
      title: '严重程度',
      width: '100px',
      render: (value: ExceptionSeverity) => getSeverityBadge(value),
    },
    {
      key: 'status',
      title: '处理状态',
      width: '120px',
      render: (value: ExceptionStatus) => getStatusBadge(value),
    },
    {
      key: 'reportedBy',
      title: '报告人',
      width: '100px',
    },
    {
      key: 'reportedAt',
      title: '报告时间',
      width: '150px',
    },
    {
      key: 'estimatedLoss',
      title: '预估损失',
      width: '100px',
      render: (value: number | undefined) =>
        value ? `¥${value.toLocaleString()}` : '-',
    },
    {
      key: 'actions',
      title: '操作',
      width: '150px',
      render: (_: any, record: SpecialException) => (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleViewException(record)}
          >
            <Eye className='h-4 w-4 mr-1' />
            详情
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleEditException(record)}
            disabled={record.status === 'closed'}
          >
            <Edit className='h-4 w-4 mr-1' />
            处理
          </Button>
        </div>
      ),
    },
  ]

  /**
   * 查看异常详情
   */
  const handleViewException = (exception: SpecialException) => {
    setSelectedException(exception)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  /**
   * 处理异常
   */
  const handleEditException = (exception: SpecialException) => {
    setSelectedException(exception)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 新建异常
   */
  const handleCreateException = () => {
    const newException: SpecialException = {
      id: '',
      source: 'manual',
      sourceId: '',
      exceptionType: 'other',
      severity: 'medium',
      status: 'open',
      title: '',
      description: '',
      reportedBy: '',
      reportedAt: new Date().toISOString(),
      impact: '',
      followUpActions: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedException(newException)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 保存异常
   */
  const handleSaveException = () => {
    if (!selectedException) return

    if (selectedException.id) {
      // 更新现有异常
      setExceptions(prev =>
        prev.map(exception =>
          exception.id === selectedException.id
            ? { ...selectedException, updatedAt: new Date().toISOString() }
            : exception
        )
      )
      toast.success('异常信息已更新')
    } else {
      // 创建新异常
      const newId = `SEC${String(exceptions.length + 1).padStart(3, '0')}`
      const newException = {
        ...selectedException,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setExceptions(prev => [...prev, newException])
      toast.success('异常已创建')
    }

    setIsDialogOpen(false)
    setSelectedException(null)
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>特检异常中心</h1>
          <p className='text-gray-600 mt-1'>统一管理特检实验中的所有异常情况</p>
        </div>
        <Button onClick={handleCreateException}>
          <Plus className='h-4 w-4 mr-2' />
          新建异常
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              总异常数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {exceptions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              待处理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {exceptions.filter(e => e.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              调查中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {exceptions.filter(e => e.status === 'investigating').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              已解决
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {exceptions.filter(e => e.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              紧急异常
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {exceptions.filter(e => e.severity === 'critical').length}
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
                  placeholder='搜索异常标题、描述或样本编号...'
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
                  <SelectItem value='open'>待处理</SelectItem>
                  <SelectItem value='investigating'>调查中</SelectItem>
                  <SelectItem value='resolved'>已解决</SelectItem>
                  <SelectItem value='closed'>已关闭</SelectItem>
                  <SelectItem value='escalated'>已升级</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='严重程度' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部程度</SelectItem>
                  <SelectItem value='low'>低</SelectItem>
                  <SelectItem value='medium'>中</SelectItem>
                  <SelectItem value='high'>高</SelectItem>
                  <SelectItem value='critical'>紧急</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='来源' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部来源</SelectItem>
                  <SelectItem value='wet_lab'>湿实验</SelectItem>
                  <SelectItem value='machine'>设备操作</SelectItem>
                  <SelectItem value='analysis'>数据分析</SelectItem>
                  <SelectItem value='manual'>手动报告</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 异常列表 */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            data={filteredExceptions}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </CardContent>
      </Card>

      {/* 异常详情/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? selectedException?.id
                  ? '处理异常'
                  : '新建异常'
                : '异常详情'}
            </DialogTitle>
          </DialogHeader>
          {selectedException && (
            <Tabs defaultValue='basic' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='basic'>基本信息</TabsTrigger>
                <TabsTrigger value='investigation'>调查处理</TabsTrigger>
                <TabsTrigger value='impact'>影响评估</TabsTrigger>
                <TabsTrigger value='followup'>后续行动</TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>异常编号</Label>
                    <Input
                      value={selectedException.id}
                      disabled
                      placeholder='系统自动生成'
                    />
                  </div>
                  <div>
                    <Label>异常来源</Label>
                    <Select
                      value={selectedException.source}
                      onValueChange={(value: ExceptionSource) =>
                        setSelectedException({
                          ...selectedException,
                          source: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='wet_lab'>湿实验</SelectItem>
                        <SelectItem value='machine'>设备操作</SelectItem>
                        <SelectItem value='analysis'>数据分析</SelectItem>
                        <SelectItem value='manual'>手动报告</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>异常类型</Label>
                    <Select
                      value={selectedException.exceptionType}
                      onValueChange={(value: ExceptionType) =>
                        setSelectedException({
                          ...selectedException,
                          exceptionType: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='wet_lab'>湿实验异常</SelectItem>
                        <SelectItem value='machine_operation'>
                          设备操作异常
                        </SelectItem>
                        <SelectItem value='data_analysis'>
                          数据分析异常
                        </SelectItem>
                        <SelectItem value='quality_control'>
                          质控异常
                        </SelectItem>
                        <SelectItem value='sample_handling'>
                          样本处理异常
                        </SelectItem>
                        <SelectItem value='other'>其他异常</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>严重程度</Label>
                    <Select
                      value={selectedException.severity}
                      onValueChange={(value: ExceptionSeverity) =>
                        setSelectedException({
                          ...selectedException,
                          severity: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='low'>低</SelectItem>
                        <SelectItem value='medium'>中</SelectItem>
                        <SelectItem value='high'>高</SelectItem>
                        <SelectItem value='critical'>紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>样本编号</Label>
                    <Input
                      value={selectedException.sampleId || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          sampleId: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>实验编号</Label>
                    <Input
                      value={selectedException.experimentId || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          experimentId: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>报告人</Label>
                    <Input
                      value={selectedException.reportedBy}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          reportedBy: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>分配给</Label>
                    <Input
                      value={selectedException.assignedTo || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          assignedTo: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>异常标题</Label>
                  <Input
                    value={selectedException.title}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        title: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>异常描述</Label>
                  <Textarea
                    value={selectedException.description}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        description: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value='investigation' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>调查人员</Label>
                    <Input
                      value={selectedException.investigatedBy || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          investigatedBy: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>解决人员</Label>
                    <Input
                      value={selectedException.resolvedBy || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          resolvedBy: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>根本原因</Label>
                  <Textarea
                    value={selectedException.rootCause || ''}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        rootCause: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>解决方案</Label>
                  <Textarea
                    value={selectedException.resolution || ''}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        resolution: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>预防措施</Label>
                  <Textarea
                    value={selectedException.preventiveMeasures || ''}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        preventiveMeasures: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value='impact' className='space-y-4'>
                <div>
                  <Label>影响描述</Label>
                  <Textarea
                    value={selectedException.impact}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        impact: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>预估损失 (元)</Label>
                    <Input
                      type='number'
                      value={selectedException.estimatedLoss || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          estimatedLoss: Number(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>实际损失 (元)</Label>
                    <Input
                      type='number'
                      value={selectedException.actualLoss || ''}
                      onChange={e =>
                        setSelectedException({
                          ...selectedException,
                          actualLoss: Number(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='followup' className='space-y-4'>
                <div>
                  <Label>后续行动</Label>
                  <Textarea
                    value={selectedException.followUpActions.join('\n')}
                    onChange={e =>
                      setSelectedException({
                        ...selectedException,
                        followUpActions: e.target.value
                          .split('\n')
                          .filter(a => a.trim()),
                      })
                    }
                    disabled={!isEditing}
                    rows={5}
                    placeholder='每行一个行动项...'
                  />
                </div>
                <div>
                  <Label>附件列表</Label>
                  <div className='space-y-2'>
                    {selectedException.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 border rounded'
                      >
                        <span>{attachment}</span>
                        <Button variant='outline' size='sm'>
                          查看
                        </Button>
                      </div>
                    ))}
                    {selectedException.attachments.length === 0 && (
                      <p className='text-gray-500 text-sm'>暂无附件</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          {isEditing && (
            <div className='flex justify-end gap-2 mt-6'>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveException}>保存</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
