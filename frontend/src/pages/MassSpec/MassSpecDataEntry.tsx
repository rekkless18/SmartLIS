/**
 * 质谱数据录入页面
 * 支持质谱数据录入和批量导入
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Download,
  Save,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react'
import FormBuilder from '../../components/FormBuilder'
import { toast } from 'sonner'

// 质谱数据接口
interface MassSpecData {
  id?: string
  experimentId: string
  peakId: string
  mz: number
  intensity: number
  retentionTime: number
  compound?: string
  formula?: string
  adduct?: string
  confidence: number
  notes?: string
}

// 批量导入模板数据
const templateData = [
  {
    peakId: 'P001',
    mz: 123.456,
    intensity: 1000000,
    retentionTime: 5.23,
    compound: '化合物A',
    formula: 'C6H12O6',
    adduct: '[M+H]+',
    confidence: 95,
    notes: '示例数据',
  },
  {
    peakId: 'P002',
    mz: 234.567,
    intensity: 800000,
    retentionTime: 7.45,
    compound: '化合物B',
    formula: 'C12H22O11',
    adduct: '[M+Na]+',
    confidence: 88,
    notes: '示例数据',
  },
]

/**
 * 质谱数据录入页面组件
 * @returns 质谱数据录入页面
 */
const MassSpecDataEntry: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [loading, setLoading] = useState(false)
  const [batchData, setBatchData] = useState<MassSpecData[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState('')

  // 单条数据录入表单配置
  const singleDataFields = [
    {
      name: 'experimentId',
      label: '实验编号',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'MS-2025-001', label: 'MS-2025-001 - 血清样本A' },
        { value: 'MS-2025-002', label: 'MS-2025-002 - 尿液样本B' },
        { value: 'MS-2025-003', label: 'MS-2025-003 - 组织样本C' },
      ],
      placeholder: '请选择实验',
    },
    {
      name: 'peakId',
      label: '峰编号',
      type: 'text' as const,
      required: true,
      placeholder: '请输入峰编号，如：P001',
    },
    {
      name: 'mz',
      label: 'm/z值',
      type: 'number' as const,
      required: true,
      placeholder: '请输入质荷比值',
      step: 0.001,
    },
    {
      name: 'intensity',
      label: '强度',
      type: 'number' as const,
      required: true,
      placeholder: '请输入峰强度值',
    },
    {
      name: 'retentionTime',
      label: '保留时间(分钟)',
      type: 'number' as const,
      required: true,
      placeholder: '请输入保留时间',
      step: 0.01,
    },
    {
      name: 'compound',
      label: '化合物名称',
      type: 'text' as const,
      placeholder: '请输入化合物名称（可选）',
    },
    {
      name: 'formula',
      label: '分子式',
      type: 'text' as const,
      placeholder: '请输入分子式（可选）',
    },
    {
      name: 'adduct',
      label: '加合离子',
      type: 'select' as const,
      options: [
        { value: '[M+H]+', label: '[M+H]+' },
        { value: '[M+Na]+', label: '[M+Na]+' },
        { value: '[M+K]+', label: '[M+K]+' },
        { value: '[M-H]-', label: '[M-H]-' },
        { value: '[M+Cl]-', label: '[M+Cl]-' },
        { value: '[M+HCOO]-', label: '[M+HCOO]-' },
      ],
      placeholder: '请选择加合离子（可选）',
    },
    {
      name: 'confidence',
      label: '置信度(%)',
      type: 'number' as const,
      required: true,
      placeholder: '请输入置信度(0-100)',
      min: 0,
      max: 100,
    },
    {
      name: 'notes',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注信息（可选）',
    },
  ]

  /**
   * 处理单条数据提交
   * @param data 表单数据
   */
  const handleSingleSubmit = async (data: any) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('数据录入成功')
      // 可以选择跳转到列表页面或清空表单
    } catch (error) {
      toast.error('数据录入失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理文件上传
   * @param event 文件上传事件
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedExperiment) {
      toast.error('请先选择实验编号')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const headers = lines[0].split(',')

        const data: MassSpecData[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length >= 5) {
            data.push({
              experimentId: selectedExperiment,
              peakId: values[0]?.trim() || '',
              mz: parseFloat(values[1]) || 0,
              intensity: parseFloat(values[2]) || 0,
              retentionTime: parseFloat(values[3]) || 0,
              compound: values[4]?.trim() || '',
              formula: values[5]?.trim() || '',
              adduct: values[6]?.trim() || '',
              confidence: parseFloat(values[7]) || 0,
              notes: values[8]?.trim() || '',
            })
          }
        }

        setBatchData(data)
        toast.success(`成功导入 ${data.length} 条数据`)
      } catch (error) {
        toast.error('文件解析失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
  }

  /**
   * 下载导入模板
   */
  const downloadTemplate = () => {
    const headers = [
      '峰编号',
      'm/z值',
      '强度',
      '保留时间',
      '化合物名称',
      '分子式',
      '加合离子',
      '置信度',
      '备注',
    ]
    const csvContent = [
      headers.join(','),
      ...templateData.map(row =>
        [
          row.peakId,
          row.mz,
          row.intensity,
          row.retentionTime,
          row.compound,
          row.formula,
          row.adduct,
          row.confidence,
          row.notes,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '质谱数据导入模板.csv'
    link.click()
  }

  /**
   * 处理批量数据提交
   */
  const handleBatchSubmit = async () => {
    if (batchData.length === 0) {
      toast.error('请先导入数据')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`成功录入 ${batchData.length} 条数据`)
      setBatchData([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error('批量录入失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除批量数据中的某一行
   * @param index 行索引
   */
  const removeBatchRow = (index: number) => {
    setBatchData(prev => prev.filter((_, i) => i !== index))
  }

  /**
   * 添加新的批量数据行
   */
  const addBatchRow = () => {
    setBatchData(prev => [
      ...prev,
      {
        experimentId: selectedExperiment,
        peakId: '',
        mz: 0,
        intensity: 0,
        retentionTime: 0,
        confidence: 0,
      },
    ])
  }

  /**
   * 更新批量数据
   * @param index 行索引
   * @param field 字段名
   * @param value 新值
   */
  const updateBatchData = (
    index: number,
    field: keyof MassSpecData,
    value: any
  ) => {
    setBatchData(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  return (
    <div className='p-6'>
      {/* 页面标题 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>质谱数据录入</h1>
        <p className='text-gray-600 mt-1'>
          录入质谱实验数据，支持单条录入和批量导入
        </p>
      </div>

      {/* 标签页切换 */}
      <div className='mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('single')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              单条录入
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'batch'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              批量导入
            </button>
          </nav>
        </div>
      </div>

      {/* 单条录入 */}
      {activeTab === 'single' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <FormBuilder
            fields={singleDataFields}
            onSubmit={handleSingleSubmit}
            loading={loading}
            submitText='保存数据'
            layout='vertical'
          />
        </div>
      )}

      {/* 批量导入 */}
      {activeTab === 'batch' && (
        <div className='space-y-6'>
          {/* 实验选择和文件上传 */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              批量导入设置
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  选择实验 <span className='text-red-500'>*</span>
                </label>
                <select
                  value={selectedExperiment}
                  onChange={e => setSelectedExperiment(e.target.value)}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>请选择实验</option>
                  <option value='MS-2025-001'>MS-2025-001 - 血清样本A</option>
                  <option value='MS-2025-002'>MS-2025-002 - 尿液样本B</option>
                  <option value='MS-2025-003'>MS-2025-003 - 组织样本C</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  上传CSV文件
                </label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv'
                  onChange={handleFileUpload}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex space-x-4'>
              <button
                onClick={downloadTemplate}
                className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
              >
                <Download className='w-4 h-4' />
                <span>下载模板</span>
              </button>

              <button
                onClick={addBatchRow}
                disabled={!selectedExperiment}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400'
              >
                <Plus className='w-4 h-4' />
                <span>手动添加行</span>
              </button>
            </div>
          </div>

          {/* 数据预览和编辑 */}
          {batchData.length > 0 && (
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  数据预览 ({batchData.length} 条)
                </h3>
                <button
                  onClick={handleBatchSubmit}
                  disabled={loading}
                  className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400'
                >
                  <Save className='w-4 h-4' />
                  <span>{loading ? '提交中...' : '提交数据'}</span>
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        峰编号
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        m/z值
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        强度
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        保留时间
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        化合物
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        置信度
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {batchData.map((row, index) => (
                      <tr key={index}>
                        <td className='px-3 py-2'>
                          <input
                            type='text'
                            value={row.peakId}
                            onChange={e =>
                              updateBatchData(index, 'peakId', e.target.value)
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='number'
                            step='0.001'
                            value={row.mz}
                            onChange={e =>
                              updateBatchData(
                                index,
                                'mz',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='number'
                            value={row.intensity}
                            onChange={e =>
                              updateBatchData(
                                index,
                                'intensity',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='number'
                            step='0.01'
                            value={row.retentionTime}
                            onChange={e =>
                              updateBatchData(
                                index,
                                'retentionTime',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='text'
                            value={row.compound || ''}
                            onChange={e =>
                              updateBatchData(index, 'compound', e.target.value)
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='number'
                            min='0'
                            max='100'
                            value={row.confidence}
                            onChange={e =>
                              updateBatchData(
                                index,
                                'confidence',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <button
                            onClick={() => removeBatchRow(index)}
                            className='text-red-600 hover:text-red-800'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 导入说明 */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5' />
              <div>
                <h4 className='text-sm font-medium text-blue-900'>导入说明</h4>
                <div className='mt-2 text-sm text-blue-700'>
                  <ul className='list-disc list-inside space-y-1'>
                    <li>请使用CSV格式文件，编码为UTF-8</li>
                    <li>文件第一行为表头，数据从第二行开始</li>
                    <li>必填字段：峰编号、m/z值、强度、保留时间、置信度</li>
                    <li>可选字段：化合物名称、分子式、加合离子、备注</li>
                    <li>建议先下载模板文件，按照格式填写数据</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MassSpecDataEntry
