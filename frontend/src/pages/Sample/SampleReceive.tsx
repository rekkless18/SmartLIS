/**
 * 样本接收页面
 * 样本接收功能页面，支持可视化孔位管理
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  CheckCircle,
  TestTube,
} from 'lucide-react'
import FormBuilder, { FormField } from '../../components/FormBuilder'
import ContainerInfo from '../../components/ContainerInfo'
import WellPlateVisualization, {
  WellInfo,
  WellStatus,
} from '../../components/WellPlateVisualization'
import PackageInfo, { PackageData } from '../../components/PackageInfo'
import { toast } from 'sonner'

// 样本来源选项
const sampleSourceOptions = [
  { label: '客户送检', value: 'client' },
  { label: '现场采样', value: 'field' },
  { label: '内部质控', value: 'qc' },
  { label: '标准样品', value: 'standard' },
  { label: '其他', value: 'other' },
]

// 样本状态选项
const sampleStatusOptions = [
  { label: '待接收', value: 'pending' },
  { label: '已接收', value: 'received' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
]

// 容器规格接口
interface ContainerSpec {
  rows: number
  cols: number
  name: string
}

// 样本信息接口（简化版）
interface SampleInfo {
  id: string
  sampleCode: string
  source: string
  wellPosition?: string // 孔位位置
  receivedDate: string
  receivedBy: string
  status: string
}

const SampleReceive: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [receiveMode, setReceiveMode] = useState<'single' | 'batch'>('single')

  // 容器和孔位状态
  const [containerSpec, setContainerSpec] = useState<ContainerSpec>({
    rows: 8,
    cols: 12,
    name: '12×8 (96孔板)',
  })
  const [wells, setWells] = useState<WellInfo[]>([])
  const [selectedWells, setSelectedWells] = useState<string[]>([])

  // 样本和包裹信息
  const [samples, setSamples] = useState<SampleInfo[]>([
    {
      id: '1',
      sampleCode: '',
      source: '',
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: '',
      status: 'pending',
    },
  ])
  const [packageData, setPackageData] = useState<PackageData>({})

  // 处理容器规格变化
  const handleContainerSpecChange = (spec: ContainerSpec) => {
    setContainerSpec(spec)
    setSelectedWells([]) // 重置选中的孔位
  }

  // 处理孔位选择
  const handleWellSelect = (well: WellInfo) => {
    if (well.status === WellStatus.SELECTED) {
      setSelectedWells(prev => [...prev, well.id])
    } else {
      setSelectedWells(prev => prev.filter(id => id !== well.id))
    }
  }

  // 处理孔位数据变化
  const handleWellsChange = (newWells: WellInfo[]) => {
    setWells(newWells)
  }

  // 处理包裹信息变化
  const handlePackageDataChange = (data: PackageData) => {
    setPackageData(data)
  }

  // 分配样本到孔位
  const assignSampleToWell = (sampleId: string, wellId: string) => {
    const well = wells.find(w => w.id === wellId)
    if (!well) return

    const wellPosition = well.position

    // 更新样本的孔位信息
    setSamples(prev =>
      prev.map(sample =>
        sample.id === sampleId ? { ...sample, wellPosition } : sample
      )
    )

    // 更新孔位状态为已占用
    setWells(prev =>
      prev.map(w =>
        w.id === wellId
          ? {
              ...w,
              status: WellStatus.OCCUPIED,
              sampleId,
              sampleCode: samples.find(s => s.id === sampleId)?.sampleCode,
            }
          : w
      )
    )

    // 从选中列表中移除
    setSelectedWells(prev => prev.filter(id => id !== wellId))

    toast.success(`样本已分配到孔位 ${wellPosition}`)
  }

  // 取消样本孔位分配
  const unassignSampleFromWell = (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId)
    if (!sample?.wellPosition) return

    // 找到对应的孔位
    const well = wells.find(w => w.sampleId === sampleId)
    if (!well) return

    // 更新样本信息
    setSamples(prev =>
      prev.map(s => (s.id === sampleId ? { ...s, wellPosition: undefined } : s))
    )

    // 更新孔位状态为空闲
    setWells(prev =>
      prev.map(w =>
        w.sampleId === sampleId
          ? {
              ...w,
              status: WellStatus.EMPTY,
              sampleId: undefined,
              sampleCode: undefined,
            }
          : w
      )
    )

    toast.success(`已取消样本的孔位分配`)
  }

  // 自动分配样本到选中的孔位
  const autoAssignSamplesToWells = () => {
    const availableSamples = samples.filter(
      s => !s.wellPosition && s.sampleCode
    )
    const selectedWellsList = wells.filter(
      w => selectedWells.includes(w.id) && w.status === WellStatus.SELECTED
    )

    if (availableSamples.length === 0) {
      toast.error('没有可分配的样本')
      return
    }

    if (selectedWellsList.length === 0) {
      toast.error('请先选择孔位')
      return
    }

    const assignCount = Math.min(
      availableSamples.length,
      selectedWellsList.length
    )

    for (let i = 0; i < assignCount; i++) {
      assignSampleToWell(availableSamples[i].id, selectedWellsList[i].id)
    }

    toast.success(`成功分配 ${assignCount} 个样本到孔位`)
  }

  // 接收信息表单字段
  const receiveFields: FormField[] = [
    {
      name: 'receivedDate',
      label: '接收日期',
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'receivedBy',
      label: '接收人员',
      type: 'text',
      placeholder: '请输入接收人员姓名',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'status',
      label: '样本状态',
      type: 'select',
      options: sampleStatusOptions,
      defaultValue: 'received',
      rules: [{ required: true }],
      span: 8,
    },
    {
      name: 'receiveNotes',
      label: '接收备注',
      type: 'textarea',
      placeholder: '请输入接收备注信息',
      span: 24,
    },
  ]

  // 添加样本
  const addSample = () => {
    const newSample: SampleInfo = {
      id: Date.now().toString(),
      sampleCode: '',
      source: '',
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: '',
      status: 'pending',
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
  const updateSample = (id: string, field: keyof SampleInfo, value: any) => {
    setSamples(
      samples.map(sample =>
        sample.id === id ? { ...sample, [field]: value } : sample
      )
    )
  }

  // 提交表单
  const handleSubmit = async (receiveData: Record<string, any>) => {
    // 验证样本信息
    for (const sample of samples) {
      if (!sample.sampleCode || !sample.source) {
        toast.error('请完善所有样本信息（样本编号和来源为必填项）')
        return
      }
    }

    setLoading(true)
    try {
      // 构建提交数据
      const submitData = {
        ...receiveData,
        samples,
        containerSpec,
        wells,
        packageData,
        receiveMode,
        receivedAt: new Date().toISOString(),
      }

      console.log('样本接收数据:', submitData)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(`成功接收 ${samples.length} 个样本！`)
      navigate('/sample')
    } catch (error) {
      console.error('接收失败:', error)
      toast.error('接收失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6'>
      {/* 页面标题 */}
      <div className='bg-white rounded-lg shadow-md border p-4 md:p-6'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/sample')}
            className='p-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>样本接收</h1>
            <p className='text-gray-600 mt-1'>
              接收新的样本信息，支持可视化孔位管理
            </p>
          </div>
        </div>
      </div>

      {/* 上方信息区域 - 容器信息、包裹信息、接收信息 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* 容器信息 - 缩小版 */}
        <div className='bg-white rounded-lg shadow-md border p-4'>
          <ContainerInfo
            onSpecChange={handleContainerSpecChange}
            initialSpec={containerSpec}
            compact={true}
          />
        </div>

        {/* 包裹信息 - 缩小版 */}
        <div className='bg-white rounded-lg shadow-md border p-4'>
          <PackageInfo
            onDataChange={handlePackageDataChange}
            initialData={packageData}
            compact={true}
          />
        </div>

        {/* 接收信息 - 缩小版 */}
        <div className='bg-white rounded-lg shadow-md border p-4'>
          <h3 className='text-md font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
            接收信息
          </h3>
          <FormBuilder
            fields={receiveFields}
            layout={{ layout: 'vertical', size: 'small' }}
            showSubmit={false}
            compact={true}
          />
        </div>
      </div>

      {/* 主要内容区域 - 可视化和样本信息 */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* 左侧 - 可视化孔位 */}
        <div className='xl:col-span-2'>
          <div className='bg-white rounded-lg shadow-md border p-4 md:p-6'>
            <WellPlateVisualization
              containerSpec={containerSpec}
              onWellSelect={handleWellSelect}
              onWellsChange={handleWellsChange}
              selectedWells={selectedWells}
              occupiedWells={{}}
              multiSelect={receiveMode === 'batch'}
            />
          </div>
        </div>

        {/* 右侧 - 样本信息 */}
        <div className='xl:col-span-1'>
          <form
            onSubmit={e => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const receiveData: Record<string, any> = {}

              // 提取接收信息
              receiveFields.forEach(field => {
                receiveData[field.name] = formData.get(field.name)
              })

              handleSubmit(receiveData)
            }}
          >
            {/* 接收模式选择 */}
            <div className='bg-white rounded-lg shadow-md border p-3 md:p-4 mb-3 md:mb-4'>
              <h3 className='text-md font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                接收模式
              </h3>
              <div className='flex flex-col space-y-2'>
                <button
                  type='button'
                  onClick={() => setReceiveMode('single')}
                  className={`px-3 py-2 rounded-md border transition-colors text-sm ${
                    receiveMode === 'single'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Package className='w-4 h-4 inline mr-2' />
                  单个接收
                </button>
                <button
                  type='button'
                  onClick={() => setReceiveMode('batch')}
                  className={`px-3 py-2 rounded-md border transition-colors text-sm ${
                    receiveMode === 'batch'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className='w-4 h-4 inline mr-2' />
                  批量接收
                </button>
              </div>
            </div>

            {/* 样本信息（简化版） */}
            <div className='bg-white rounded-lg shadow-md border p-3 md:p-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <TestTube className='w-4 h-4 text-green-600' />
                  <h3 className='text-md font-semibold text-gray-900'>
                    样本信息
                  </h3>
                </div>
                <div className='flex flex-col space-y-1'>
                  {selectedWells.length > 0 && (
                    <button
                      type='button'
                      onClick={autoAssignSamplesToWells}
                      className='inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
                    >
                      <Package className='w-3 h-3 mr-1' />
                      批量分配 ({selectedWells.length})
                    </button>
                  )}
                  {receiveMode === 'batch' && (
                    <button
                      type='button'
                      onClick={addSample}
                      className='inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                    >
                      <Plus className='w-3 h-3 mr-1' />
                      添加样本
                    </button>
                  )}
                </div>
              </div>

              <div className='space-y-3 max-h-80 xl:max-h-96 overflow-y-auto'>
                {samples.map((sample, index) => (
                  <div
                    key={sample.id}
                    className='bg-gray-50 border border-gray-200 rounded p-3'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        样本 {index + 1}
                      </h4>
                      {receiveMode === 'batch' && samples.length > 1 && (
                        <button
                          type='button'
                          onClick={() => removeSample(sample.id)}
                          className='text-red-600 hover:text-red-800 transition-colors'
                        >
                          <Trash2 className='w-3 h-3' />
                        </button>
                      )}
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1'>
                          样本编号 <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          value={sample.sampleCode}
                          onChange={e =>
                            updateSample(
                              sample.id,
                              'sampleCode',
                              e.target.value
                            )
                          }
                          placeholder='请输入样本编号'
                          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          required
                        />
                      </div>

                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1'>
                          样本来源 <span className='text-red-500'>*</span>
                        </label>
                        <select
                          value={sample.source}
                          onChange={e =>
                            updateSample(sample.id, 'source', e.target.value)
                          }
                          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          required
                        >
                          <option value=''>请选择样本来源</option>
                          {sampleSourceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 孔位分配状态和操作 */}
                    <div className='mt-3'>
                      {sample.wellPosition ? (
                        <div className='flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded'>
                          <div className='text-xs text-blue-700'>
                            <span className='font-medium'>孔位:</span>{' '}
                            {sample.wellPosition}
                          </div>
                          <button
                            type='button'
                            onClick={() => unassignSampleFromWell(sample.id)}
                            className='text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors'
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded'>
                          <div className='text-xs text-gray-600'>
                            <span className='font-medium'>未分配孔位</span>
                            {!sample.sampleCode && (
                              <span className='text-gray-500 block'>
                                (请先填写编号)
                              </span>
                            )}
                          </div>
                          {sample.sampleCode && selectedWells.length > 0 && (
                            <button
                              type='button'
                              onClick={() => {
                                const firstSelectedWell = selectedWells[0]
                                assignSampleToWell(sample.id, firstSelectedWell)
                              }}
                              className='text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'
                            >
                              分配
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className='mt-3 md:mt-4 space-y-2'>
              <button
                type='submit'
                disabled={loading}
                className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm'
              >
                {loading ? '接收中...' : '确认接收'}
              </button>
              <button
                type='button'
                onClick={() => navigate('/sample')}
                className='w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm text-sm'
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SampleReceive
