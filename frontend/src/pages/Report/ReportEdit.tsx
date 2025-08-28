/**
 * 报告编辑页面
 * 支持报告内容编辑、格式设置、预览功能
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  FileText,
  Settings,
  Download,
  Upload,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

// 报告数据接口
interface ReportEditData {
  id: string
  reportNumber: string
  sampleNumber: string
  clientName: string
  clientContact: string
  testItems: string[]
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  createdBy: string
  reviewer?: string
  dueDate: string
  reportType: string
  content: {
    summary: string
    testMethods: string
    results: string
    conclusion: string
    recommendations: string
    attachments: string[]
  }
  template: string
}

// 报告模板选项
const templateOptions = [
  { value: 'standard', label: '标准检测报告' },
  { value: 'environmental', label: '环境检测报告' },
  { value: 'food', label: '食品检测报告' },
  { value: 'material', label: '材料检测报告' },
]

// 模拟报告数据
const mockReportData: ReportEditData = {
  id: '1',
  reportNumber: 'RPT-2025-001',
  sampleNumber: 'SMP-2025-001',
  clientName: '华为技术有限公司',
  clientContact: '张经理 (13800138000)',
  testItems: ['重金属检测', '有机物分析'],
  status: 'draft',
  priority: 'high',
  createdAt: '2025-01-20 09:00:00',
  updatedAt: '2025-01-22 14:30:00',
  createdBy: '张三',
  dueDate: '2025-01-25',
  reportType: '检测报告',
  content: {
    summary:
      '本次检测针对华为技术有限公司送检的电子产品进行重金属和有机物分析，检测项目包括铅、汞、镉、六价铬等重金属含量，以及多种有机化合物的定性定量分析。',
    testMethods:
      '采用ICP-MS法检测重金属含量，GC-MS法检测有机物成分。所有检测方法均符合国家标准GB/T 26125-2011和GB/T 26572-2011的要求。',
    results:
      '检测结果显示：\n1. 重金属含量：铅 < 0.1 mg/kg，汞 < 0.01 mg/kg，镉 < 0.05 mg/kg，六价铬 < 0.1 mg/kg\n2. 有机物分析：未检出限制性有机化合物\n3. 所有检测项目均符合相关标准要求',
    conclusion:
      '根据检测结果，送检样品的重金属含量和有机物成分均符合相关标准要求，产品质量合格。',
    recommendations:
      '建议继续保持现有的生产工艺和质量控制体系，定期进行产品质量检测，确保产品持续符合标准要求。',
    attachments: ['检测数据表.xlsx', '色谱图.pdf', '质谱图.pdf'],
  },
  template: 'standard',
}

const ReportEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reportData, setReportData] = useState<ReportEditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  /**
   * 加载报告数据
   */
  const loadReportData = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportData(mockReportData)
    } catch (error) {
      console.error('加载报告数据失败:', error)
      toast.error('加载报告数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存报告
   */
  const handleSave = async () => {
    if (!reportData) return

    try {
      setSaving(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('报告保存成功')
    } catch (error) {
      console.error('保存报告失败:', error)
      toast.error('保存报告失败')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 提交审核
   */
  const handleSubmitReview = async () => {
    if (!reportData) return

    try {
      setSaving(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      setReportData(prev =>
        prev ? { ...prev, status: 'pending_review' } : null
      )
      toast.success('报告已提交审核')
    } catch (error) {
      console.error('提交审核失败:', error)
      toast.error('提交审核失败')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 更新报告内容
   * @param field 字段名
   * @param value 字段值
   */
  const updateContent = (
    field: keyof ReportEditData['content'],
    value: string
  ) => {
    if (!reportData) return

    setReportData(prev =>
      prev
        ? {
            ...prev,
            content: {
              ...prev.content,
              [field]: value,
            },
          }
        : null
    )
  }

  /**
   * 更新基本信息
   * @param field 字段名
   * @param value 字段值
   */
  const updateBasicInfo = (field: keyof ReportEditData, value: any) => {
    if (!reportData) return

    setReportData(prev =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    )
  }

  /**
   * 导出报告
   */
  const handleExport = () => {
    toast.success('报告导出成功')
  }

  /**
   * 复制报告
   */
  const handleCopy = () => {
    toast.success('报告复制成功')
  }

  useEffect(() => {
    loadReportData()
  }, [id])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-gray-500 mt-2'>加载中...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>报告不存在</p>
        <Button onClick={() => navigate('/report')} className='mt-4'>
          返回报告列表
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/report')}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            返回
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              编辑报告 - {reportData.reportNumber}
            </h1>
            <p className='text-gray-600 mt-1'>
              样本编号: {reportData.sampleNumber} | 客户:{' '}
              {reportData.clientName}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className='h-4 w-4 mr-2' />
            {previewMode ? '编辑模式' : '预览模式'}
          </Button>
          <Button variant='outline' size='sm' onClick={handleExport}>
            <Download className='h-4 w-4 mr-2' />
            导出
          </Button>
          <Button variant='outline' size='sm' onClick={handleCopy}>
            <Copy className='h-4 w-4 mr-2' />
            复制
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSave}
            disabled={saving}
          >
            <Save className='h-4 w-4 mr-2' />
            {saving ? '保存中...' : '保存'}
          </Button>
          {reportData.status === 'draft' && (
            <Button size='sm' onClick={handleSubmitReview} disabled={saving}>
              <Send className='h-4 w-4 mr-2' />
              提交审核
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* 左侧编辑区域 */}
        <div className='lg:col-span-3 space-y-6'>
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    报告编号
                  </label>
                  <Input
                    value={reportData.reportNumber}
                    disabled
                    className='bg-gray-50'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    样本编号
                  </label>
                  <Input
                    value={reportData.sampleNumber}
                    disabled
                    className='bg-gray-50'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    客户名称
                  </label>
                  <Input
                    value={reportData.clientName}
                    onChange={e =>
                      updateBasicInfo('clientName', e.target.value)
                    }
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    客户联系方式
                  </label>
                  <Input
                    value={reportData.clientContact}
                    onChange={e =>
                      updateBasicInfo('clientContact', e.target.value)
                    }
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    截止日期
                  </label>
                  <Input
                    type='date'
                    value={reportData.dueDate}
                    onChange={e => updateBasicInfo('dueDate', e.target.value)}
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    报告模板
                  </label>
                  <select
                    value={reportData.template}
                    onChange={e => updateBasicInfo('template', e.target.value)}
                    disabled={previewMode}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {templateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  检测项目
                </label>
                <div className='flex flex-wrap gap-2'>
                  {reportData.testItems.map((item, index) => (
                    <Badge key={index} variant='outline'>
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 报告内容 */}
          <Card>
            <CardHeader>
              <CardTitle>报告内容</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 检测概述 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  检测概述
                </label>
                <textarea
                  value={reportData.content.summary}
                  onChange={e => updateContent('summary', e.target.value)}
                  disabled={previewMode}
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  placeholder='请输入检测概述...'
                />
              </div>

              {/* 检测方法 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  检测方法
                </label>
                <textarea
                  value={reportData.content.testMethods}
                  onChange={e => updateContent('testMethods', e.target.value)}
                  disabled={previewMode}
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  placeholder='请输入检测方法...'
                />
              </div>

              {/* 检测结果 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  检测结果
                </label>
                <textarea
                  value={reportData.content.results}
                  onChange={e => updateContent('results', e.target.value)}
                  disabled={previewMode}
                  rows={6}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  placeholder='请输入检测结果...'
                />
              </div>

              {/* 结论 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  结论
                </label>
                <textarea
                  value={reportData.content.conclusion}
                  onChange={e => updateContent('conclusion', e.target.value)}
                  disabled={previewMode}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  placeholder='请输入结论...'
                />
              </div>

              {/* 建议 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  建议
                </label>
                <textarea
                  value={reportData.content.recommendations}
                  onChange={e =>
                    updateContent('recommendations', e.target.value)
                  }
                  disabled={previewMode}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  placeholder='请输入建议...'
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className='space-y-6'>
          {/* 状态信息 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Settings className='h-5 w-5 mr-2' />
                状态信息
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  当前状态
                </label>
                <Badge
                  className={
                    reportData.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : reportData.status === 'pending_review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : reportData.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : reportData.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                  }
                >
                  {reportData.status === 'draft'
                    ? '草稿'
                    : reportData.status === 'pending_review'
                      ? '待审核'
                      : reportData.status === 'approved'
                        ? '已批准'
                        : reportData.status === 'rejected'
                          ? '已驳回'
                          : '已发送'}
                </Badge>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  优先级
                </label>
                <Badge
                  className={
                    reportData.priority === 'low'
                      ? 'bg-gray-100 text-gray-800'
                      : reportData.priority === 'normal'
                        ? 'bg-blue-100 text-blue-800'
                        : reportData.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                  }
                >
                  {reportData.priority === 'low'
                    ? '低'
                    : reportData.priority === 'normal'
                      ? '普通'
                      : reportData.priority === 'high'
                        ? '高'
                        : '紧急'}
                </Badge>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  创建人
                </label>
                <p className='text-sm text-gray-600'>{reportData.createdBy}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  创建时间
                </label>
                <p className='text-sm text-gray-600'>{reportData.createdAt}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  更新时间
                </label>
                <p className='text-sm text-gray-600'>{reportData.updatedAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* 附件 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Upload className='h-5 w-5 mr-2' />
                附件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {reportData.content.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                  >
                    <span className='text-sm text-gray-700 truncate'>
                      {attachment}
                    </span>
                    <Button size='sm' variant='ghost'>
                      <Download className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
                {!previewMode && (
                  <Button size='sm' variant='outline' className='w-full'>
                    <Upload className='h-3 w-3 mr-2' />
                    上传附件
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ReportEdit
