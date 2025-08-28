/**
 * 分析解读页面
 * 管理特检实验的数据分析和结果解读
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
  FileText,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
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
import { Progress } from '../../components/ui/progress'
import { toast } from 'sonner'

// 分析状态类型
type AnalysisStatus =
  | 'pending'
  | 'analyzing'
  | 'completed'
  | 'reviewed'
  | 'approved'
  | 'rejected'

// 分析类型
type AnalysisType =
  | 'genomic'
  | 'proteomic'
  | 'metabolomic'
  | 'transcriptomic'
  | 'pathology'
  | 'other'

// 分析解读数据接口
interface AnalysisInterpretation {
  id: string
  sampleId: string
  experimentId: string
  analysisType: AnalysisType
  status: AnalysisStatus
  title: string
  description: string
  analyst: string
  reviewer?: string
  startTime: string
  endTime?: string
  progress: number // 分析进度 0-100
  rawDataPath?: string
  processedDataPath?: string
  reportPath?: string
  findings: string[]
  interpretation: string
  conclusion: string
  recommendations: string[]
  confidence: number // 置信度 0-100
  qualityScore: number // 质量评分 0-100
  notes?: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

// 模拟分析解读数据
const mockAnalysisData: AnalysisInterpretation[] = [
  {
    id: 'AI001',
    sampleId: 'S001',
    experimentId: 'EXP001',
    analysisType: 'genomic',
    status: 'analyzing',
    title: '全基因组测序分析',
    description: '对患者样本进行全基因组测序数据分析',
    analyst: '张三',
    startTime: '2025-01-15 09:00:00',
    progress: 75,
    findings: [
      '检测到BRCA1基因c.5266dupC突变',
      '发现TP53基因p.R273H错义突变',
      '检测到MSH2基因大片段缺失',
    ],
    interpretation:
      '患者携带多个与遗传性肿瘤易感相关的基因变异，其中BRCA1突变为致病性变异，TP53和MSH2变异需要进一步验证。',
    conclusion: '基于检测结果，患者具有较高的遗传性乳腺癌和结直肠癌风险。',
    recommendations: [
      '建议进行家族史调查',
      '推荐定期乳腺和结直肠癌筛查',
      '考虑遗传咨询',
    ],
    confidence: 85,
    qualityScore: 92,
    attachments: ['WGS_report.pdf', 'variant_list.xlsx'],
    createdAt: '2025-01-15 08:30:00',
    updatedAt: '2025-01-15 14:30:00',
  },
  {
    id: 'AI002',
    sampleId: 'S002',
    experimentId: 'EXP002',
    analysisType: 'proteomic',
    status: 'completed',
    title: '蛋白质组学分析',
    description: '血清蛋白质组学差异表达分析',
    analyst: '李四',
    reviewer: '王五',
    startTime: '2025-01-14 10:00:00',
    endTime: '2025-01-14 18:00:00',
    progress: 100,
    findings: [
      '检测到125个差异表达蛋白质',
      '上调蛋白质主要富集在炎症反应通路',
      '下调蛋白质与代谢过程相关',
    ],
    interpretation:
      '蛋白质组学分析显示患者存在明显的炎症反应和代谢紊乱，这与临床表现一致。',
    conclusion:
      '蛋白质表达谱支持炎症性疾病的诊断，建议结合临床症状进行综合判断。',
    recommendations: ['建议检测炎症标志物', '监测代谢指标变化', '考虑抗炎治疗'],
    confidence: 78,
    qualityScore: 88,
    attachments: ['proteomics_report.pdf', 'pathway_analysis.png'],
    createdAt: '2025-01-14 09:30:00',
    updatedAt: '2025-01-14 18:00:00',
  },
]

/**
 * 获取分析状态显示样式
 */
const getStatusBadge = (status: AnalysisStatus) => {
  const statusConfig = {
    pending: { label: '待分析', className: 'bg-gray-100 text-gray-800' },
    analyzing: { label: '分析中', className: 'bg-blue-100 text-blue-800' },
    completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
    reviewed: { label: '已审核', className: 'bg-purple-100 text-purple-800' },
    approved: { label: '已批准', className: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }

  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 获取分析类型显示文本
 */
const getAnalysisTypeText = (type: AnalysisType) => {
  const typeMap = {
    genomic: '基因组学',
    proteomic: '蛋白质组学',
    metabolomic: '代谢组学',
    transcriptomic: '转录组学',
    pathology: '病理学',
    other: '其他分析',
  }
  return typeMap[type]
}

/**
 * 获取置信度颜色
 */
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-600'
  if (confidence >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export default function AnalysisInterpretation() {
  const [analyses, setAnalyses] =
    useState<AnalysisInterpretation[]>(mockAnalysisData)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisInterpretation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 过滤分析数据
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch =
      analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.analyst.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || analysis.status === statusFilter
    const matchesType =
      typeFilter === 'all' || analysis.analysisType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // 表格列配置
  const columns = [
    {
      key: 'id',
      title: '分析编号',
      width: '100px',
    },
    {
      key: 'sampleId',
      title: '样本编号',
      width: '100px',
    },
    {
      key: 'title',
      title: '分析标题',
      width: '200px',
    },
    {
      key: 'analysisType',
      title: '分析类型',
      width: '120px',
      render: (value: AnalysisType) => getAnalysisTypeText(value),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value: AnalysisStatus) => getStatusBadge(value),
    },
    {
      key: 'progress',
      title: '进度',
      width: '120px',
      render: (value: number) => (
        <div className='flex items-center gap-2'>
          <Progress value={value} className='w-16' />
          <span className='text-sm'>{value}%</span>
        </div>
      ),
    },
    {
      key: 'analyst',
      title: '分析员',
      width: '100px',
    },
    {
      key: 'confidence',
      title: '置信度',
      width: '100px',
      render: (value: number) => (
        <span className={getConfidenceColor(value)}>{value}%</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '200px',
      render: (_: any, record: AnalysisInterpretation) => (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleViewAnalysis(record)}
          >
            <Eye className='h-4 w-4 mr-1' />
            查看
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleEditAnalysis(record)}
            disabled={record.status === 'approved'}
          >
            <Edit className='h-4 w-4 mr-1' />
            编辑
          </Button>
          {record.reportPath && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDownloadReport(record.reportPath!)}
            >
              <Download className='h-4 w-4 mr-1' />
              报告
            </Button>
          )}
        </div>
      ),
    },
  ]

  /**
   * 查看分析详情
   */
  const handleViewAnalysis = (analysis: AnalysisInterpretation) => {
    setSelectedAnalysis(analysis)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  /**
   * 编辑分析
   */
  const handleEditAnalysis = (analysis: AnalysisInterpretation) => {
    setSelectedAnalysis(analysis)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 新建分析
   */
  const handleCreateAnalysis = () => {
    const newAnalysis: AnalysisInterpretation = {
      id: '',
      sampleId: '',
      experimentId: '',
      analysisType: 'genomic',
      status: 'pending',
      title: '',
      description: '',
      analyst: '',
      startTime: '',
      progress: 0,
      findings: [],
      interpretation: '',
      conclusion: '',
      recommendations: [],
      confidence: 0,
      qualityScore: 0,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedAnalysis(newAnalysis)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  /**
   * 下载报告
   */
  const handleDownloadReport = (reportPath: string) => {
    // 模拟下载
    toast.success(`正在下载报告: ${reportPath}`)
  }

  /**
   * 保存分析
   */
  const handleSaveAnalysis = () => {
    if (!selectedAnalysis) return

    if (selectedAnalysis.id) {
      // 更新现有分析
      setAnalyses(prev =>
        prev.map(analysis =>
          analysis.id === selectedAnalysis.id
            ? { ...selectedAnalysis, updatedAt: new Date().toISOString() }
            : analysis
        )
      )
      toast.success('分析信息已更新')
    } else {
      // 创建新分析
      const newId = `AI${String(analyses.length + 1).padStart(3, '0')}`
      const newAnalysis = {
        ...selectedAnalysis,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setAnalyses(prev => [...prev, newAnalysis])
      toast.success('分析已创建')
    }

    setIsDialogOpen(false)
    setSelectedAnalysis(null)
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>分析解读</h1>
          <p className='text-gray-600 mt-1'>管理特检实验的数据分析和结果解读</p>
        </div>
        <Button onClick={handleCreateAnalysis}>
          <Plus className='h-4 w-4 mr-2' />
          新建分析
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              总分析数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {analyses.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              分析中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {analyses.filter(a => a.status === 'analyzing').length}
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
              {
                analyses.filter(
                  a => a.status === 'completed' || a.status === 'approved'
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              平均置信度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {Math.round(
                analyses.reduce((sum, a) => sum + a.confidence, 0) /
                  analyses.length
              )}
              %
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
                  placeholder='搜索分析标题、样本编号或分析员...'
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
                  <SelectItem value='pending'>待分析</SelectItem>
                  <SelectItem value='analyzing'>分析中</SelectItem>
                  <SelectItem value='completed'>已完成</SelectItem>
                  <SelectItem value='reviewed'>已审核</SelectItem>
                  <SelectItem value='approved'>已批准</SelectItem>
                  <SelectItem value='rejected'>已驳回</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-32'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='类型' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部类型</SelectItem>
                  <SelectItem value='genomic'>基因组学</SelectItem>
                  <SelectItem value='proteomic'>蛋白质组学</SelectItem>
                  <SelectItem value='metabolomic'>代谢组学</SelectItem>
                  <SelectItem value='transcriptomic'>转录组学</SelectItem>
                  <SelectItem value='pathology'>病理学</SelectItem>
                  <SelectItem value='other'>其他分析</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分析列表 */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            data={filteredAnalyses}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </CardContent>
      </Card>

      {/* 分析详情/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? selectedAnalysis?.id
                  ? '编辑分析'
                  : '新建分析'
                : '分析详情'}
            </DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <Tabs defaultValue='basic' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='basic'>基本信息</TabsTrigger>
                <TabsTrigger value='findings'>发现结果</TabsTrigger>
                <TabsTrigger value='interpretation'>解读结论</TabsTrigger>
                <TabsTrigger value='attachments'>附件文件</TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>分析编号</Label>
                    <Input
                      value={selectedAnalysis.id}
                      disabled
                      placeholder='系统自动生成'
                    />
                  </div>
                  <div>
                    <Label>样本编号</Label>
                    <Input
                      value={selectedAnalysis.sampleId}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          sampleId: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>实验编号</Label>
                    <Input
                      value={selectedAnalysis.experimentId}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          experimentId: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>分析类型</Label>
                    <Select
                      value={selectedAnalysis.analysisType}
                      onValueChange={(value: AnalysisType) =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          analysisType: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='genomic'>基因组学</SelectItem>
                        <SelectItem value='proteomic'>蛋白质组学</SelectItem>
                        <SelectItem value='metabolomic'>代谢组学</SelectItem>
                        <SelectItem value='transcriptomic'>转录组学</SelectItem>
                        <SelectItem value='pathology'>病理学</SelectItem>
                        <SelectItem value='other'>其他分析</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>分析员</Label>
                    <Input
                      value={selectedAnalysis.analyst}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          analyst: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>审核员</Label>
                    <Input
                      value={selectedAnalysis.reviewer || ''}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          reviewer: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>置信度 (%)</Label>
                    <Input
                      type='number'
                      min='0'
                      max='100'
                      value={selectedAnalysis.confidence}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          confidence: Number(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>质量评分 (%)</Label>
                    <Input
                      type='number'
                      min='0'
                      max='100'
                      value={selectedAnalysis.qualityScore}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          qualityScore: Number(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>分析标题</Label>
                  <Input
                    value={selectedAnalysis.title}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        title: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>分析描述</Label>
                  <Textarea
                    value={selectedAnalysis.description}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        description: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value='findings' className='space-y-4'>
                <div>
                  <Label>主要发现</Label>
                  <Textarea
                    value={selectedAnalysis.findings.join('\n')}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        findings: e.target.value
                          .split('\n')
                          .filter(f => f.trim()),
                      })
                    }
                    disabled={!isEditing}
                    rows={6}
                    placeholder='每行一个发现...'
                  />
                </div>
              </TabsContent>

              <TabsContent value='interpretation' className='space-y-4'>
                <div>
                  <Label>结果解读</Label>
                  <Textarea
                    value={selectedAnalysis.interpretation}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        interpretation: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>结论</Label>
                  <Textarea
                    value={selectedAnalysis.conclusion}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        conclusion: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>建议</Label>
                  <Textarea
                    value={selectedAnalysis.recommendations.join('\n')}
                    onChange={e =>
                      setSelectedAnalysis({
                        ...selectedAnalysis,
                        recommendations: e.target.value
                          .split('\n')
                          .filter(r => r.trim()),
                      })
                    }
                    disabled={!isEditing}
                    rows={4}
                    placeholder='每行一个建议...'
                  />
                </div>
                {selectedAnalysis.notes && (
                  <div>
                    <Label>备注</Label>
                    <Textarea
                      value={selectedAnalysis.notes}
                      onChange={e =>
                        setSelectedAnalysis({
                          ...selectedAnalysis,
                          notes: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={2}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value='attachments' className='space-y-4'>
                <div>
                  <Label>附件列表</Label>
                  <div className='space-y-2'>
                    {selectedAnalysis.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 border rounded'
                      >
                        <span className='flex items-center gap-2'>
                          <FileText className='h-4 w-4' />
                          {attachment}
                        </span>
                        <Button variant='outline' size='sm'>
                          <Download className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                    {selectedAnalysis.attachments.length === 0 && (
                      <p className='text-gray-500 text-sm'>暂无附件</p>
                    )}
                  </div>
                  {isEditing && (
                    <Button variant='outline' className='mt-2'>
                      <Upload className='h-4 w-4 mr-2' />
                      上传附件
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          {isEditing && (
            <div className='flex justify-end gap-2 mt-6'>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveAnalysis}>保存</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
