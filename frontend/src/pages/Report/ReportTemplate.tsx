/**
 * 报告模板管理页面
 * 支持模板创建、编辑、删除和应用
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import DataTable, {
  type TableColumn,
  type TableAction,
} from '../../components/DataTable'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import Modal from '../../components/Modal'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  Save,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// 报告模板数据接口
interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'standard' | 'environmental' | 'food' | 'material' | 'custom'
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  usageCount: number
  template: {
    header: string
    sections: TemplateSection[]
    footer: string
    styles: TemplateStyles
  }
}

// 模板章节接口
interface TemplateSection {
  id: string
  title: string
  content: string
  order: number
  required: boolean
  type: 'text' | 'table' | 'image' | 'chart'
}

// 模板样式接口
interface TemplateStyles {
  fontSize: number
  fontFamily: string
  lineHeight: number
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  colors: {
    primary: string
    secondary: string
    text: string
  }
}

// 模板分类配置
const categoryConfig = {
  standard: { label: '标准模板', className: 'bg-blue-100 text-blue-800' },
  environmental: {
    label: '环境检测',
    className: 'bg-green-100 text-green-800',
  },
  food: { label: '食品检测', className: 'bg-orange-100 text-orange-800' },
  material: { label: '材料检测', className: 'bg-purple-100 text-purple-800' },
  custom: { label: '自定义', className: 'bg-gray-100 text-gray-800' },
}

/**
 * 获取分类徽章
 * @param category 分类
 * @returns JSX元素
 */
const getCategoryBadge = (category: string) => {
  const config = categoryConfig[category as keyof typeof categoryConfig] || {
    label: '未知',
    className: 'bg-gray-100 text-gray-800',
  }
  return <Badge className={config.className}>{config.label}</Badge>
}

/**
 * 模拟模板数据
 */
const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: '标准检测报告模板',
    description: '适用于常规检测项目的标准报告模板',
    category: 'standard',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-15 10:00:00',
    updatedAt: '2025-01-20 14:30:00',
    createdBy: '系统管理员',
    usageCount: 25,
    template: {
      header: '检测报告',
      sections: [
        {
          id: '1',
          title: '检测概述',
          content:
            '本次检测针对{客户名称}送检的{样本类型}进行{检测项目}检测...',
          order: 1,
          required: true,
          type: 'text',
        },
        {
          id: '2',
          title: '检测方法',
          content: '采用{检测方法}进行检测，符合{标准编号}要求...',
          order: 2,
          required: true,
          type: 'text',
        },
        {
          id: '3',
          title: '检测结果',
          content: '检测结果表格',
          order: 3,
          required: true,
          type: 'table',
        },
        {
          id: '4',
          title: '结论',
          content: '根据检测结果，{结论内容}...',
          order: 4,
          required: true,
          type: 'text',
        },
      ],
      footer: '本报告仅对送检样本负责',
      styles: {
        fontSize: 12,
        fontFamily: 'SimSun',
        lineHeight: 1.5,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        colors: { primary: '#1f2937', secondary: '#6b7280', text: '#374151' },
      },
    },
  },
  {
    id: '2',
    name: '环境检测报告模板',
    description: '专用于环境监测项目的报告模板',
    category: 'environmental',
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-16 09:30:00',
    updatedAt: '2025-01-18 16:45:00',
    createdBy: '张三',
    usageCount: 12,
    template: {
      header: '环境检测报告',
      sections: [
        {
          id: '1',
          title: '监测概况',
          content: '本次环境监测针对{监测点位}进行{监测项目}监测...',
          order: 1,
          required: true,
          type: 'text',
        },
        {
          id: '2',
          title: '监测方法',
          content: '按照{环境标准}执行监测...',
          order: 2,
          required: true,
          type: 'text',
        },
        {
          id: '3',
          title: '监测结果',
          content: '监测数据表格',
          order: 3,
          required: true,
          type: 'table',
        },
        {
          id: '4',
          title: '评价结论',
          content: '根据监测结果，环境质量{评价结论}...',
          order: 4,
          required: true,
          type: 'text',
        },
      ],
      footer: '本报告仅对监测时段和监测点位负责',
      styles: {
        fontSize: 12,
        fontFamily: 'SimSun',
        lineHeight: 1.5,
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
        colors: { primary: '#059669', secondary: '#10b981', text: '#374151' },
      },
    },
  },
  {
    id: '3',
    name: '食品检测报告模板',
    description: '适用于食品安全检测的专用模板',
    category: 'food',
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-17 11:15:00',
    updatedAt: '2025-01-19 13:20:00',
    createdBy: '李四',
    usageCount: 8,
    template: {
      header: '食品检测报告',
      sections: [
        {
          id: '1',
          title: '样品信息',
          content:
            '样品名称：{样品名称}\n生产日期：{生产日期}\n保质期：{保质期}...',
          order: 1,
          required: true,
          type: 'text',
        },
        {
          id: '2',
          title: '检测项目',
          content: '按照{食品标准}进行{检测项目}检测...',
          order: 2,
          required: true,
          type: 'text',
        },
        {
          id: '3',
          title: '检测结果',
          content: '食品检测数据表格',
          order: 3,
          required: true,
          type: 'table',
        },
        {
          id: '4',
          title: '安全评价',
          content: '根据检测结果，该食品{安全评价}...',
          order: 4,
          required: true,
          type: 'text',
        },
      ],
      footer: '本报告仅对送检样品负责，不代表整批产品质量',
      styles: {
        fontSize: 12,
        fontFamily: 'SimSun',
        lineHeight: 1.5,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        colors: { primary: '#dc2626', secondary: '#ef4444', text: '#374151' },
      },
    },
  },
]

const ReportTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    default: 0,
  })
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create'
  )
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'standard' as ReportTemplate['category'],
    isDefault: false,
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  /**
   * 加载模板数据
   */
  const loadTemplates = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTemplates(mockTemplates)

      // 计算统计数据
      const newStats = {
        total: mockTemplates.length,
        active: mockTemplates.filter(t => t.isActive).length,
        inactive: mockTemplates.filter(t => !t.isActive).length,
        default: mockTemplates.filter(t => t.isDefault).length,
      }
      setStats(newStats)
    } catch (error) {
      console.error('加载模板数据失败:', error)
      toast.error('加载模板数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开创建模板模态框
   */
  const handleCreate = () => {
    setSelectedTemplate(null)
    setFormData({
      name: '',
      description: '',
      category: 'standard',
      isDefault: false,
      isActive: true,
    })
    setModalMode('create')
    setModalOpen(true)
  }

  /**
   * 处理编辑模板
   * @param record 模板记录
   */
  const handleEdit = (record: ReportTemplate) => {
    setSelectedTemplate(record)
    setFormData({
      name: record.name,
      description: record.description,
      category: record.category,
      isDefault: record.isDefault,
      isActive: record.isActive,
    })
    setModalMode('edit')
    setModalOpen(true)
  }

  /**
   * 处理查看模板
   * @param record 模板记录
   */
  const handleView = (record: ReportTemplate) => {
    setSelectedTemplate(record)
    setModalMode('view')
    setModalOpen(true)
  }

  /**
   * 处理复制模板
   * @param record 模板记录
   */
  const handleCopy = (record: ReportTemplate) => {
    setSelectedTemplate(record)
    setFormData({
      name: `${record.name} - 副本`,
      description: record.description,
      category: record.category,
      isDefault: false,
      isActive: true,
    })
    setModalMode('create')
    setModalOpen(true)
  }

  /**
   * 处理删除模板
   * @param record 模板记录
   */
  const handleDelete = async (record: ReportTemplate) => {
    if (record.isDefault) {
      toast.error('默认模板不能删除')
      return
    }

    if (record.usageCount > 0) {
      toast.error('该模板正在使用中，不能删除')
      return
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTemplates(prev => prev.filter(t => t.id !== record.id))
      toast.success('模板删除成功')
    } catch (error) {
      console.error('删除模板失败:', error)
      toast.error('删除模板失败')
    }
  }

  /**
   * 处理设置默认模板
   * @param record 模板记录
   */
  const handleSetDefault = async (record: ReportTemplate) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTemplates(prev =>
        prev.map(t => ({
          ...t,
          isDefault: t.id === record.id,
        }))
      )
      toast.success('默认模板设置成功')
    } catch (error) {
      console.error('设置默认模板失败:', error)
      toast.error('设置默认模板失败')
    }
  }

  /**
   * 处理切换模板状态
   * @param record 模板记录
   */
  const handleToggleStatus = async (record: ReportTemplate) => {
    if (record.isDefault && record.isActive) {
      toast.error('默认模板不能禁用')
      return
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTemplates(prev =>
        prev.map(t =>
          t.id === record.id ? { ...t, isActive: !t.isActive } : t
        )
      )
      toast.success(`模板${record.isActive ? '禁用' : '启用'}成功`)
    } catch (error) {
      console.error('切换模板状态失败:', error)
      toast.error('切换模板状态失败')
    }
  }

  /**
   * 保存模板
   */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入模板名称')
      return
    }

    try {
      setSaving(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (modalMode === 'create') {
        const newTemplate: ReportTemplate = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
          createdBy: '当前用户',
          usageCount: 0,
          template: selectedTemplate?.template || {
            header: '检测报告',
            sections: [],
            footer: '本报告仅对送检样本负责',
            styles: {
              fontSize: 12,
              fontFamily: 'SimSun',
              lineHeight: 1.5,
              margins: { top: 20, right: 20, bottom: 20, left: 20 },
              colors: {
                primary: '#1f2937',
                secondary: '#6b7280',
                text: '#374151',
              },
            },
          },
        }
        setTemplates(prev => [...prev, newTemplate])
        toast.success('模板创建成功')
      } else if (modalMode === 'edit' && selectedTemplate) {
        setTemplates(prev =>
          prev.map(t =>
            t.id === selectedTemplate.id
              ? {
                  ...t,
                  ...formData,
                  updatedAt: new Date().toLocaleString('zh-CN'),
                }
              : t
          )
        )
        toast.success('模板更新成功')
      }

      setModalOpen(false)
    } catch (error) {
      console.error('保存模板失败:', error)
      toast.error('保存模板失败')
    } finally {
      setSaving(false)
    }
  }

  // 表格列配置
  const columns: TableColumn<ReportTemplate>[] = [
    {
      key: 'name',
      title: '模板名称',
      dataIndex: 'name',
      width: 200,
      render: (value: string, record: ReportTemplate) => (
        <div className='flex items-center space-x-2'>
          <span className='font-medium'>{value}</span>
          {record.isDefault && (
            <Badge className='bg-blue-100 text-blue-800 text-xs'>默认</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      title: '描述',
      dataIndex: 'description',
      width: 250,
    },
    {
      key: 'category',
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (value: string) => getCategoryBadge(value),
    },
    {
      key: 'isActive',
      title: '状态',
      dataIndex: 'isActive',
      width: 100,
      render: (value: boolean) => (
        <Badge
          className={
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }
        >
          {value ? '启用' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'usageCount',
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 100,
      render: (value: number) => (
        <span className='text-sm font-medium'>{value}</span>
      ),
    },
    {
      key: 'createdBy',
      title: '创建人',
      dataIndex: 'createdBy',
      width: 100,
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 250,
      render: (value: any, record: ReportTemplate) => (
        <div className='flex space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleView(record)}
            className='h-8 px-2'
          >
            <Eye className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleEdit(record)}
            className='h-8 px-2'
          >
            <Edit className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleCopy(record)}
            className='h-8 px-2'
          >
            <Copy className='h-3 w-3' />
          </Button>
          {!record.isDefault && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleSetDefault(record)}
              className='h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50'
            >
              <Settings className='h-3 w-3' />
            </Button>
          )}
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleToggleStatus(record)}
            className={`h-8 px-2 ${
              record.isActive
                ? 'text-red-600 border-red-200 hover:bg-red-50'
                : 'text-green-600 border-green-200 hover:bg-green-50'
            }`}
            disabled={record.isDefault && record.isActive}
          >
            {record.isActive ? (
              <X className='h-3 w-3' />
            ) : (
              <Settings className='h-3 w-3' />
            )}
          </Button>
          {!record.isDefault && record.usageCount === 0 && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleDelete(record)}
              className='h-8 px-2 text-red-600 border-red-200 hover:bg-red-50'
            >
              <Trash2 className='h-3 w-3' />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // 表格操作配置
  const actions: TableAction[] = [
    {
      key: 'create',
      label: '新建模板',
      type: 'primary',
      icon: <Plus className='h-4 w-4' />,
      onClick: handleCreate,
    },
  ]

  useEffect(() => {
    loadTemplates()
  }, [])

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>报告模板管理</h1>
        <p className='text-gray-600 mt-1'>
          管理报告模板，支持创建、编辑、删除和应用
        </p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总模板数</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>启用模板</CardTitle>
            <Settings className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>禁用模板</CardTitle>
            <X className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>
              {stats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>默认模板</CardTitle>
            <Settings className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.default}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模板列表 */}
      <Card>
        <CardContent className='p-0'>
          <DataTable
            columns={columns}
            data={templates}
            loading={loading}
            actions={actions}
            searchable
            searchPlaceholder='搜索模板名称或描述...'
            pagination={{
              current: 1,
              pageSize: 10,
              total: templates.length,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            onSearch={value => {
              console.log('搜索:', value)
            }}
          />
        </CardContent>
      </Card>

      {/* 模板编辑模态框 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'create'
            ? '新建模板'
            : modalMode === 'edit'
              ? '编辑模板'
              : '查看模板'
        }
        size='lg'
      >
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                模板名称 <span className='text-red-500'>*</span>
              </label>
              <Input
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='请输入模板名称'
                disabled={modalMode === 'view'}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                模板分类
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value as ReportTemplate['category'],
                  }))
                }
                disabled={modalMode === 'view'}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='standard'>标准模板</option>
                <option value='environmental'>环境检测</option>
                <option value='food'>食品检测</option>
                <option value='material'>材料检测</option>
                <option value='custom'>自定义</option>
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              模板描述
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              placeholder='请输入模板描述'
              disabled={modalMode === 'view'}
            />
          </div>

          <div className='flex items-center space-x-6'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.isDefault}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
                disabled={modalMode === 'view'}
                className='mr-2'
              />
              <span className='text-sm text-gray-700'>设为默认模板</span>
            </label>

            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.isActive}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                disabled={modalMode === 'view'}
                className='mr-2'
              />
              <span className='text-sm text-gray-700'>启用模板</span>
            </label>
          </div>

          {modalMode !== 'view' && (
            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
              >
                <Save className='h-4 w-4 mr-2' />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ReportTemplate
