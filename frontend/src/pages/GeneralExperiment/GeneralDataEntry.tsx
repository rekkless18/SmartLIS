/**
 * 实验数据录入页面
 * 支持批量数据录入和单个数据录入
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save,
  Upload,
  Download,
  Plus,
  Trash2,
  Eye,
  FileText,
  Calculator,
  FlaskConical,
} from 'lucide-react'
import FormBuilder from '../../components/FormBuilder'
import DataTable from '../../components/DataTable'
import { toast } from 'sonner'

// 数据录入模式
type EntryMode = 'single' | 'batch'

// 实验数据接口
interface ExperimentData {
  id: string
  experimentId: string
  parameterName: string
  parameterCode: string
  measuredValue: number | string
  unit: string
  standardValue?: number
  tolerance?: number
  result: 'pass' | 'fail' | 'pending'
  method: string
  equipment: string
  operator: string
  measureTime: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

// 实验信息接口
interface ExperimentInfo {
  id: string
  experimentCode: string
  experimentName: string
  sampleCode: string
  sampleName: string
  status: string
  assignedTo: string
  startDate: string
  endDate: string
}

// 检测参数配置
const parameterOptions = [
  { label: 'pH值', value: 'ph', unit: '', standardRange: '6.5-8.5' },
  {
    label: '化学需氧量(COD)',
    value: 'cod',
    unit: 'mg/L',
    standardRange: '≤50',
  },
  {
    label: '生化需氧量(BOD)',
    value: 'bod',
    unit: 'mg/L',
    standardRange: '≤20',
  },
  { label: '悬浮物(SS)', value: 'ss', unit: 'mg/L', standardRange: '≤30' },
  { label: '氨氮', value: 'nh3_n', unit: 'mg/L', standardRange: '≤15' },
  { label: '总磷', value: 'tp', unit: 'mg/L', standardRange: '≤0.5' },
  { label: '总氮', value: 'tn', unit: 'mg/L', standardRange: '≤20' },
  { label: '重金属-铅', value: 'pb', unit: 'mg/kg', standardRange: '≤100' },
  { label: '重金属-汞', value: 'hg', unit: 'mg/kg', standardRange: '≤0.5' },
  { label: '重金属-镉', value: 'cd', unit: 'mg/kg', standardRange: '≤1.0' },
]

// 检测方法选项
const methodOptions = [
  { label: 'GB/T 6920-1986', value: 'gb_6920_1986' },
  { label: 'HJ 828-2017', value: 'hj_828_2017' },
  { label: 'GB 11914-1989', value: 'gb_11914_1989' },
  { label: 'GB/T 11901-1989', value: 'gb_11901_1989' },
  { label: 'HJ 535-2009', value: 'hj_535_2009' },
  { label: 'GB 11893-1989', value: 'gb_11893_1989' },
  { label: 'HJ 636-2012', value: 'hj_636_2012' },
  { label: '原子吸收分光光度法', value: 'aas' },
  { label: '电感耦合等离子体质谱法', value: 'icp_ms' },
  { label: '其他', value: 'other' },
]

// 设备选项
const equipmentOptions = [
  { label: 'pH计-PHS-3C', value: 'ph_meter_phs3c' },
  { label: 'COD消解仪-XJ-Ⅱ', value: 'cod_digester_xj2' },
  { label: '分光光度计-UV-2600', value: 'spectrophotometer_uv2600' },
  { label: '原子吸收光谱仪-AA-7000', value: 'aas_aa7000' },
  { label: 'ICP-MS-7700', value: 'icp_ms_7700' },
  { label: '天平-AL204', value: 'balance_al204' },
  { label: '烘箱-DHG-9240A', value: 'oven_dhg9240a' },
  { label: '其他', value: 'other' },
]

const DataEntry: React.FC = () => {
  const navigate = useNavigate()
  const { experimentId } = useParams<{ experimentId: string }>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<EntryMode>('single')
  const [experimentInfo, setExperimentInfo] = useState<ExperimentInfo | null>(
    null
  )
  const [dataList, setDataList] = useState<ExperimentData[]>([])
  const [editingData, setEditingData] =
    useState<Partial<ExperimentData> | null>(null)
  const [showForm, setShowForm] = useState(false)

  // 模拟实验信息
  const mockExperimentInfo: ExperimentInfo = {
    id: experimentId || '1',
    experimentCode: 'EXP2025010001',
    experimentName: '工业废水COD检测',
    sampleCode: 'S2025010001',
    sampleName: '工业废水样本',
    status: 'running',
    assignedTo: '张三',
    startDate: '2025-01-20',
    endDate: '2025-01-22',
  }

  // 模拟已录入数据
  const mockDataList: ExperimentData[] = [
    {
      id: '1',
      experimentId: experimentId || '1',
      parameterName: 'pH值',
      parameterCode: 'ph',
      measuredValue: 7.2,
      unit: '',
      standardValue: 7.0,
      tolerance: 0.5,
      result: 'pass',
      method: 'GB/T 6920-1986',
      equipment: 'pH计-PHS-3C',
      operator: '张三',
      measureTime: '2025-01-21T10:30:00',
      remarks: '测量环境温度25℃',
      createdAt: '2025-01-21T10:30:00Z',
      updatedAt: '2025-01-21T10:30:00Z',
    },
    {
      id: '2',
      experimentId: experimentId || '1',
      parameterName: '化学需氧量(COD)',
      parameterCode: 'cod',
      measuredValue: 45.6,
      unit: 'mg/L',
      standardValue: 50,
      tolerance: 5,
      result: 'pass',
      method: 'HJ 828-2017',
      equipment: 'COD消解仪-XJ-Ⅱ',
      operator: '张三',
      measureTime: '2025-01-21T14:15:00',
      remarks: '消解时间2小时',
      createdAt: '2025-01-21T14:15:00Z',
      updatedAt: '2025-01-21T14:15:00Z',
    },
  ]

  // 加载实验信息和数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        setExperimentInfo(mockExperimentInfo)
        setDataList(mockDataList)
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [experimentId])

  // 单个数据录入表单配置
  const singleEntryFields = [
    {
      name: 'parameterCode',
      label: '检测参数',
      type: 'select' as const,
      required: true,
      options: parameterOptions.map(p => ({ label: p.label, value: p.value })),
      onChange: (value: string) => {
        const param = parameterOptions.find(p => p.value === value)
        if (param && editingData) {
          setEditingData({
            ...editingData,
            parameterCode: value,
            parameterName: param.label,
            unit: param.unit,
          })
        }
      },
    },
    {
      name: 'measuredValue',
      label: '测量值',
      type: 'number' as const,
      required: true,
      placeholder: '请输入测量值',
    },
    {
      name: 'unit',
      label: '单位',
      type: 'text' as const,
      disabled: true,
    },
    {
      name: 'method',
      label: '检测方法',
      type: 'select' as const,
      required: true,
      options: methodOptions,
    },
    {
      name: 'equipment',
      label: '使用设备',
      type: 'select' as const,
      required: true,
      options: equipmentOptions,
    },
    {
      name: 'measureTime',
      label: '测量时间',
      type: 'datetime-local' as const,
      required: true,
    },
    {
      name: 'remarks',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注信息（可选）',
    },
  ]

  // 表格列配置
  const columns = [
    {
      key: 'parameterName',
      title: '检测参数',
      dataIndex: 'parameterName',
      width: 150,
      render: (value: string, record: ExperimentData) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500'>{record.parameterCode}</div>
        </div>
      ),
    },
    {
      key: 'measuredValue',
      title: '测量值',
      dataIndex: 'measuredValue',
      width: 120,
      render: (value: number | string, record: ExperimentData) => (
        <div className='text-center'>
          <div className='font-medium'>
            {value} {record.unit}
          </div>
          {record.standardValue && (
            <div className='text-xs text-gray-500'>
              标准: {record.standardValue}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'result',
      title: '结果',
      dataIndex: 'result',
      width: 80,
      render: (value: string) => {
        const resultConfig = {
          pass: { label: '合格', className: 'bg-green-100 text-green-800' },
          fail: { label: '不合格', className: 'bg-red-100 text-red-800' },
          pending: {
            label: '待定',
            className: 'bg-yellow-100 text-yellow-800',
          },
        }
        const config =
          resultConfig[value as keyof typeof resultConfig] ||
          resultConfig.pending
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'method',
      title: '检测方法',
      dataIndex: 'method',
      width: 120,
      render: (value: string) => (
        <span className='text-sm text-gray-600'>{value}</span>
      ),
    },
    {
      key: 'equipment',
      title: '使用设备',
      dataIndex: 'equipment',
      width: 120,
      render: (value: string) => (
        <span className='text-sm text-gray-600'>{value}</span>
      ),
    },
    {
      key: 'operator',
      title: '操作员',
      dataIndex: 'operator',
      width: 80,
      render: (value: string) => (
        <span className='text-sm font-medium'>{value}</span>
      ),
    },
    {
      key: 'measureTime',
      title: '测量时间',
      dataIndex: 'measureTime',
      width: 140,
      render: (value: string) => (
        <span className='text-sm text-gray-600'>
          {new Date(value).toLocaleString('zh-CN')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 100,
      render: (record: ExperimentData) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleEdit(record)}
            className='p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
            title='编辑'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className='p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors'
            title='删除'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ]

  // 处理新增数据
  const handleAdd = () => {
    setEditingData({
      experimentId: experimentId || '1',
      operator: experimentInfo?.assignedTo || '',
      measureTime: new Date().toISOString().slice(0, 16),
      result: 'pending',
    })
    setShowForm(true)
  }

  // 处理编辑数据
  const handleEdit = (record: ExperimentData) => {
    setEditingData({
      ...record,
      measureTime: record.measureTime.slice(0, 16),
    })
    setShowForm(true)
  }

  // 处理删除数据
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条数据吗？')) return

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      setDataList(dataList.filter(item => item.id !== id))
      toast.success('数据删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败，请重试')
    }
  }

  // 处理表单提交
  const handleSubmit = async (formData: any) => {
    setSaving(true)
    try {
      // 计算结果
      const param = parameterOptions.find(
        p => p.value === formData.parameterCode
      )
      let result = 'pending'
      if (param && param.standardRange && formData.measuredValue) {
        // 简单的结果判断逻辑
        if (param.standardRange.includes('≤')) {
          const limit = parseFloat(param.standardRange.replace('≤', ''))
          result = formData.measuredValue <= limit ? 'pass' : 'fail'
        } else if (param.standardRange.includes('-')) {
          const [min, max] = param.standardRange
            .split('-')
            .map(v => parseFloat(v))
          result =
            formData.measuredValue >= min && formData.measuredValue <= max
              ? 'pass'
              : 'fail'
        }
      }

      const newData: ExperimentData = {
        id: editingData?.id || Date.now().toString(),
        experimentId: experimentId || '1',
        parameterName: param?.label || '',
        parameterCode: formData.parameterCode,
        measuredValue: formData.measuredValue,
        unit: formData.unit || '',
        result: result as 'pass' | 'fail' | 'pending',
        method: formData.method,
        equipment: formData.equipment,
        operator: formData.operator || experimentInfo?.assignedTo || '',
        measureTime: formData.measureTime,
        remarks: formData.remarks || '',
        createdAt: editingData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingData?.id) {
        // 更新现有数据
        setDataList(
          dataList.map(item => (item.id === editingData.id ? newData : item))
        )
        toast.success('数据更新成功')
      } else {
        // 添加新数据
        setDataList([...dataList, newData])
        toast.success('数据录入成功')
      }

      setShowForm(false)
      setEditingData(null)
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 处理批量导入
  const handleBatchImport = () => {
    toast.info('批量导入功能开发中...')
  }

  // 处理导出模板
  const handleExportTemplate = () => {
    toast.info('导出模板功能开发中...')
  }

  // 处理保存所有数据
  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('所有数据保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* 页面标题和实验信息 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>实验数据录入</h1>
            <p className='text-gray-600 mt-1'>录入和管理实验检测数据</p>
          </div>
          <div className='flex space-x-3'>
            <button
              onClick={() => navigate('/experiment')}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
            >
              返回列表
            </button>
          </div>
        </div>

        {/* 实验信息卡片 */}
        {experimentInfo && (
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  实验编号
                </label>
                <p className='text-sm font-mono text-gray-900'>
                  {experimentInfo.experimentCode}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  实验名称
                </label>
                <p className='text-sm text-gray-900'>
                  {experimentInfo.experimentName}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  样本信息
                </label>
                <p className='text-sm text-gray-900'>
                  {experimentInfo.sampleName} ({experimentInfo.sampleCode})
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>
                  负责人
                </label>
                <p className='text-sm text-gray-900'>
                  {experimentInfo.assignedTo}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 录入模式切换和操作按钮 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-between items-center'>
          <div className='flex space-x-4'>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setMode('single')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FlaskConical className='w-4 h-4 mr-2 inline' />
                单个录入
              </button>
              <button
                onClick={() => setMode('batch')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'batch'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className='w-4 h-4 mr-2 inline' />
                批量录入
              </button>
            </div>
          </div>

          <div className='flex space-x-3'>
            {mode === 'single' && (
              <button
                onClick={handleAdd}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
              >
                <Plus className='w-4 h-4 mr-2' />
                新增数据
              </button>
            )}
            {mode === 'batch' && (
              <>
                <button
                  onClick={handleExportTemplate}
                  className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
                >
                  <Download className='w-4 h-4 mr-2' />
                  下载模板
                </button>
                <button
                  onClick={handleBatchImport}
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors'
                >
                  <Upload className='w-4 h-4 mr-2' />
                  批量导入
                </button>
              </>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors'
            >
              <Save className='w-4 h-4 mr-2' />
              {saving ? '保存中...' : '保存所有'}
            </button>
          </div>
        </div>
      </div>

      {/* 数据录入表单 */}
      {showForm && (
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              {editingData?.id ? '编辑数据' : '新增数据'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingData(null)
              }}
              className='text-gray-400 hover:text-gray-600'
            >
              ×
            </button>
          </div>
          <FormBuilder
            fields={singleEntryFields}
            initialValues={editingData}
            onSubmit={handleSubmit}
            loading={saving}
            submitText={editingData?.id ? '更新数据' : '录入数据'}
            layout='vertical'
          />
        </div>
      )}

      {/* 批量导入区域 */}
      {mode === 'batch' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
            <Upload className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              批量导入数据
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              支持Excel文件格式，请先下载模板文件
            </p>
            <div className='mt-6'>
              <button
                onClick={handleBatchImport}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
              >
                选择文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 已录入数据列表 */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium text-gray-900'>已录入数据</h3>
            <div className='text-sm text-gray-500'>
              共 {dataList.length} 条数据
            </div>
          </div>
        </div>
        <DataTable
          dataSource={dataList}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  )
}

export default DataEntry
