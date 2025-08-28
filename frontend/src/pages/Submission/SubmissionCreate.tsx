/**
 * 新建送检页面
 * 创建新的送检申请表单
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import FormBuilder, { FormField } from '../../components/FormBuilder'
import { toast } from 'sonner'

// 样本类型选项
const sampleTypeOptions = [
  { label: '水质样本', value: 'water' },
  { label: '土壤样本', value: 'soil' },
  { label: '空气样本', value: 'air' },
  { label: '食品样本', value: 'food' },
  { label: '化学品样本', value: 'chemical' },
  { label: '其他', value: 'other' },
]

// 检测项目选项
const testItemOptions = [
  { label: 'pH值测定', value: 'ph' },
  { label: '重金属检测', value: 'heavy_metals' },
  { label: '有机物检测', value: 'organic' },
  { label: '微生物检测', value: 'microbial' },
  { label: '农药残留检测', value: 'pesticide' },
  { label: '营养成分分析', value: 'nutrition' },
  { label: '毒理学检测', value: 'toxicology' },
  { label: '其他检测', value: 'other_test' },
]

// 紧急程度选项
const urgencyOptions = [
  { label: '普通', value: 'normal' },
  { label: '紧急', value: 'urgent' },
  { label: '特急', value: 'emergency' },
]

// 样本信息接口
interface SampleInfo {
  id: string
  name: string
  type: string
  quantity: number
  unit: string
  description: string
  testItems: string[]
}

const SubmissionCreate: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [samples, setSamples] = useState<SampleInfo[]>([
    {
      id: '1',
      name: '',
      type: '',
      quantity: 1,
      unit: 'kg',
      description: '',
      testItems: [],
    },
  ])

  // 客户信息表单字段
  const clientFields: FormField[] = [
    {
      name: 'clientName',
      label: '客户名称',
      type: 'text',
      placeholder: '请输入客户名称',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'contactPerson',
      label: '联系人',
      type: 'text',
      placeholder: '请输入联系人姓名',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'contactPhone',
      label: '联系电话',
      type: 'text',
      placeholder: '请输入联系电话',
      rules: [
        { required: true },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
      ],
      span: 8,
    },
    {
      name: 'contactEmail',
      label: '联系邮箱',
      type: 'email',
      placeholder: '请输入联系邮箱',
      rules: [
        { required: true },
        {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: '请输入正确的邮箱地址',
        },
      ],
      span: 12,
    },
    {
      name: 'clientAddress',
      label: '客户地址',
      type: 'textarea',
      placeholder: '请输入详细地址',
      rules: [{ required: true }],
      span: 12,
    },
  ]

  // 送检信息表单字段
  const submissionFields: FormField[] = [
    {
      name: 'urgency',
      label: '紧急程度',
      type: 'select',
      options: urgencyOptions,
      defaultValue: 'normal',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'expectedDate',
      label: '期望完成日期',
      type: 'date',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'reportDelivery',
      label: '报告交付方式',
      type: 'select',
      options: [
        { label: '电子版', value: 'electronic' },
        { label: '纸质版', value: 'paper' },
        { label: '电子版+纸质版', value: 'both' },
      ],
      defaultValue: 'electronic',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'specialRequirements',
      label: '特殊要求',
      type: 'textarea',
      placeholder: '请输入特殊要求或备注信息',
      span: 24,
    },
  ]

  // 添加样本
  const addSample = () => {
    const newSample: SampleInfo = {
      id: Date.now().toString(),
      name: '',
      type: '',
      quantity: 1,
      unit: 'kg',
      description: '',
      testItems: [],
    }
    setSamples([...samples, newSample])
  }

  // 删除样本
  const removeSample = (id: string) => {
    if (samples.length === 1) {
      toast.error('至少需要保留一个样本')
      return
    }
    setSamples(samples.filter(sample => sample.id !== id))
  }

  // 更新样本信息
  const updateSample = (id: string, field: keyof SampleInfo, value: string | number | string[]) => {
    setSamples(
      samples.map(sample =>
        sample.id === id ? { ...sample, [field]: value } : sample
      )
    )
  }

  // 提交表单
  const handleSubmit = async (
    clientData: Record<string, FormDataEntryValue | null>,
    submissionData: Record<string, FormDataEntryValue | null>
  ) => {
    // 验证样本信息
    for (const sample of samples) {
      if (!sample.name || !sample.type || sample.testItems.length === 0) {
        toast.error('请完善所有样本信息')
        return
      }
    }

    setLoading(true)
    try {
      // 构建提交数据
      const submitData = {
        ...clientData,
        ...submissionData,
        samples,
        submittedAt: new Date().toISOString(),
      }

      console.log('提交数据:', submitData)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('送检申请提交成功！')
      navigate('/submission')
    } catch (error) {
      console.error('提交失败:', error)
      toast.error('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      {/* 页面标题 */}
      <div className='flex items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <button
          onClick={() => navigate('/submission')}
          className='p-2 hover:bg-gray-100 rounded-md transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>新建送检申请</h1>
          <p className='text-gray-600 text-sm mt-1'>填写送检申请信息</p>
        </div>
      </div>

      <form
        className='space-y-8'
        onSubmit={e => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const clientData: Record<string, FormDataEntryValue | null> = {}
          const submissionData: Record<string, FormDataEntryValue | null> = {}

          // 分离客户信息和送检信息
          clientFields.forEach(field => {
            clientData[field.name] = formData.get(field.name)
          })
          submissionFields.forEach(field => {
            submissionData[field.name] = formData.get(field.name)
          })

          handleSubmit(clientData, submissionData)
        }}
      >
        {/* 客户信息 */}
        <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
          <div className='border-b border-gray-200 pb-3 mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>客户信息</h2>
          </div>
          <FormBuilder
            fields={clientFields}
            layout={{ layout: 'vertical', size: 'small' }}
            showSubmit={false}
            wrapWithForm={false}
          />
        </div>

        {/* 样本信息 */}
        <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
          <div className='flex justify-between items-center border-b border-gray-200 pb-3 mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>样本信息</h2>
            <button
              type='button'
              onClick={addSample}
              className='inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm'
            >
              <Plus className='w-4 h-4 mr-1' />
              添加样本
            </button>
          </div>

          <div className='space-y-5'>
            {samples.map((sample, index) => (
              <div
                key={sample.id}
                className='border border-gray-200 rounded-lg p-5 bg-gray-50/50 shadow-sm'
              >
                <div className='flex justify-between items-center mb-4 pb-2 border-b border-gray-200'>
                  <h3 className='font-medium text-gray-900 text-base'>
                    样本 {index + 1}
                  </h3>
                  {samples.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeSample(sample.id)}
                      className='text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      样本名称 <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={sample.name}
                      onChange={e =>
                        updateSample(sample.id, 'name', e.target.value)
                      }
                      placeholder='请输入样本名称'
                      className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      样本类型 <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={sample.type}
                      onChange={e =>
                        updateSample(sample.id, 'type', e.target.value)
                      }
                      className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      required
                    >
                      <option value=''>请选择样本类型</option>
                      {sampleTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      样本数量
                    </label>
                    <div className='flex'>
                      <input
                        type='number'
                        value={sample.quantity}
                        onChange={e =>
                          updateSample(
                            sample.id,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        min='1'
                        className='flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <select
                        value={sample.unit}
                        onChange={e =>
                          updateSample(sample.id, 'unit', e.target.value)
                        }
                        className='px-3 py-1.5 text-sm border-l-0 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='kg'>kg</option>
                        <option value='g'>g</option>
                        <option value='L'>L</option>
                        <option value='mL'>mL</option>
                        <option value='个'>个</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      检测项目 <span className='text-red-500'>*</span>
                    </label>
                    <select
                      multiple
                      value={sample.testItems}
                      onChange={e => {
                        const values = Array.from(
                          e.target.selectedOptions,
                          option => option.value
                        )
                        updateSample(sample.id, 'testItems', values)
                      }}
                      className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      size={3}
                      required
                    >
                      {testItemOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className='text-xs text-gray-500 mt-1'>
                      按住Ctrl键可多选
                    </p>
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    样本描述
                  </label>
                  <textarea
                    value={sample.description}
                    onChange={e =>
                      updateSample(sample.id, 'description', e.target.value)
                    }
                    placeholder='请输入样本描述信息'
                    rows={2}
                    className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 送检信息 */}
        <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
          <div className='border-b border-gray-200 pb-3 mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>送检信息</h2>
          </div>
          <FormBuilder
            fields={submissionFields}
            layout={{ layout: 'vertical', size: 'small' }}
            showSubmit={false}
            wrapWithForm={false}
          />
        </div>

        {/* 提交按钮 */}
        <div className='flex justify-end space-x-4 pt-2'>
          <button
            type='button'
            onClick={() => navigate('/submission')}
            className='px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm'
          >
            取消
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm'
          >
            {loading ? '提交中...' : '提交申请'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubmissionCreate
