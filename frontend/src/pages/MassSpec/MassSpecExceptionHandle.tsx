/**
 * 质谱异常处理页面
 * 处理质谱实验过程中的异常情况
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
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
import { Textarea } from '../../components/ui/textarea'
import { toast } from 'sonner'

// 异常状态类型
type ExceptionStatus = 'pending' | 'processing' | 'resolved' | 'closed'

// 异常严重程度
type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'

// 异常类型
type ExceptionType = 'equipment' | 'sample' | 'data' | 'process' | 'other'

// 质谱异常数据接口
interface MassSpecException {
  id: string
  experimentId: string
  sampleId: string
  exceptionType: ExceptionType
  severity: ExceptionSeverity
  status: ExceptionStatus
  title: string
  description: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  resolution?: string
  attachments?: string[]
}

// 模拟异常数据
const mockExceptions: MassSpecException[] = [
  {
    id: 'EXC001',
    experimentId: 'EXP001',
    sampleId: 'S001',
    exceptionType: 'equipment',
    severity: 'high',
    status: 'pending',
    title: '质谱仪器异常',
    description: '质谱仪在检测过程中出现信号异常，需要技术人员检查',
    reportedBy: '张三',
    reportedAt: '2025-01-15 09:30:00',
    assignedTo: '李四',
  },
  {
    id: 'EXC002',
    experimentId: 'EXP002',
    sampleId: 'S002',
    exceptionType: 'sample',
    severity: 'medium',
    status: 'processing',
    title: '样本质量问题',
    description: '样本浓度不符合检测要求，需要重新处理',
    reportedBy: '王五',
    reportedAt: '2025-01-15 10:15:00',
    assignedTo: '赵六',
  },
]

/**
 * 获取异常状态显示样式
 */
const getStatusBadge = (status: ExceptionStatus) => {
  const statusConfig = {
    pending: { label: '待处理', variant: 'destructive' as const, icon: Clock },
    processing: {
      label: '处理中',
      variant: 'default' as const,
      icon: AlertTriangle,
    },
    resolved: {
      label: '已解决',
      variant: 'secondary' as const,
      icon: CheckCircle,
    },
    closed: { label: '已关闭', variant: 'outline' as const, icon: XCircle },
  }

  const config = statusConfig[status]
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

  const config = severityConfig[severity]

  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取异常类型显示文本
 */
const getExceptionTypeText = (type: ExceptionType) => {
  const typeMap = {
    equipment: '设备异常',
    sample: '样本异常',
    data: '数据异常',
    process: '流程异常',
    other: '其他异常',
  }
  return typeMap[type]
}

export default function MassSpecExceptionHandle() {
  const [exceptions, setExceptions] =
    useState<MassSpecException[]>(mockExceptions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedException, setSelectedException] =
    useState<MassSpecException | null>(null)
  const [resolution, setResolution] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  // 过滤异常数据
  const filteredExceptions = exceptions.filter(exception => {
    const matchesSearch =
      exception.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exception.experimentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || exception.status === statusFilter
    const matchesSeverity =
      severityFilter === 'all' || exception.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  // 表格列配置
  const columns = [
    {
      key: 'id',
      title: '异常编号',
      width: '100px',
    },
    {
      key: 'experimentId',
      title: '实验编号',
      width: '100px',
    },
    {
      key: 'title',
      title: '异常标题',
      width: '200px',
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
      key: 'actions',
      title: '操作',
      width: '150px',
      render: (_: any, record: MassSpecException) => (
        <div className='flex gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedException(record)}
              >
                <FileText className='h-4 w-4 mr-1' />
                详情
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>异常详情 - {record.id}</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium'>实验编号</label>
                    <p className='text-sm text-gray-600'>
                      {record.experimentId}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>样本编号</label>
                    <p className='text-sm text-gray-600'>{record.sampleId}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>异常类型</label>
                    <p className='text-sm text-gray-600'>
                      {getExceptionTypeText(record.exceptionType)}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>严重程度</label>
                    <div className='mt-1'>
                      {getSeverityBadge(record.severity)}
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>处理状态</label>
                    <div className='mt-1'>{getStatusBadge(record.status)}</div>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>报告人</label>
                    <p className='text-sm text-gray-600'>{record.reportedBy}</p>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>异常描述</label>
                  <p className='text-sm text-gray-600 mt-1'>
                    {record.description}
                  </p>
                </div>
                {record.resolution && (
                  <div>
                    <label className='text-sm font-medium'>解决方案</label>
                    <p className='text-sm text-gray-600 mt-1'>
                      {record.resolution}
                    </p>
                  </div>
                )}
                {record.status === 'pending' && (
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>处理方案</label>
                    <Textarea
                      placeholder='请输入处理方案...'
                      value={resolution}
                      onChange={e => setResolution(e.target.value)}
                    />
                    <Button
                      onClick={() => handleResolveException(record.id)}
                      disabled={!resolution.trim() || isResolving}
                    >
                      {isResolving ? '处理中...' : '标记为已解决'}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ]

  /**
   * 处理异常解决
   */
  const handleResolveException = async (exceptionId: string) => {
    if (!resolution.trim()) {
      toast.error('请输入处理方案')
      return
    }

    setIsResolving(true)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      setExceptions(prev =>
        prev.map(exception =>
          exception.id === exceptionId
            ? {
                ...exception,
                status: 'resolved' as ExceptionStatus,
                resolution,
                resolvedAt: new Date().toLocaleString(),
              }
            : exception
        )
      )

      setResolution('')
      toast.success('异常已标记为解决')
    } catch (error) {
      toast.error('处理失败，请重试')
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>质谱异常处理</h1>
          <p className='text-gray-600 mt-1'>
            管理和处理质谱实验过程中的异常情况
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              待处理异常
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {exceptions.filter(e => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              处理中异常
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {exceptions.filter(e => e.status === 'processing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              已解决异常
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
                  placeholder='搜索异常标题、描述或实验编号...'
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
                  <SelectItem value='pending'>待处理</SelectItem>
                  <SelectItem value='processing'>处理中</SelectItem>
                  <SelectItem value='resolved'>已解决</SelectItem>
                  <SelectItem value='closed'>已关闭</SelectItem>
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
    </div>
  )
}
