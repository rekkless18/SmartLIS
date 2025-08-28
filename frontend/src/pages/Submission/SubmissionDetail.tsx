/**
 * 送检详情页面
 * 显示送检申请的详细信息
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Package,
  TestTube,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'

// 送检详情数据接口
interface SubmissionDetail {
  id: string
  clientName: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  clientAddress: string
  sampleCount: number
  samples: SampleDetail[]
  status: string
  statusText: string
  urgency: string
  urgencyText: string
  submittedAt: string
  expectedDate: string
  actualDate?: string
  progress: number
  reportDelivery: string
  specialRequirements?: string
  timeline: TimelineItem[]
}

// 样本详情接口
interface SampleDetail {
  id: string
  name: string
  type: string
  typeText: string
  quantity: number
  unit: string
  description: string
  testItems: TestItem[]
  status: string
  statusText: string
}

// 检测项目接口
interface TestItem {
  id: string
  name: string
  status: string
  statusText: string
  result?: string
  startTime?: string
  endTime?: string
  operator?: string
}

// 时间线项目接口
interface TimelineItem {
  id: string
  title: string
  description: string
  time: string
  status: 'completed' | 'current' | 'pending'
  operator?: string
}

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟获取送检详情数据
  useEffect(() => {
    const fetchSubmissionDetail = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟数据
        const mockData: SubmissionDetail = {
          id: id || 'SJ2025001',
          clientName: 'ABC环保科技有限公司',
          contactPerson: '张经理',
          contactPhone: '13800138001',
          contactEmail: 'zhang.manager@abc-env.com',
          clientAddress: '北京市朝阳区环保科技园区A座15楼',
          sampleCount: 3,
          samples: [
            {
              id: 'S001',
              name: '工业废水样本A',
              type: 'water',
              typeText: '水质样本',
              quantity: 2,
              unit: 'L',
              description: '来自生产车间的工业废水，需要检测重金属含量',
              status: 'testing',
              statusText: '检测中',
              testItems: [
                {
                  id: 'T001',
                  name: '重金属检测',
                  status: 'completed',
                  statusText: '已完成',
                  result: '铅: 0.05mg/L, 汞: 0.002mg/L',
                  startTime: '2025-01-21 09:00:00',
                  endTime: '2025-01-21 15:30:00',
                  operator: '李检测师',
                },
                {
                  id: 'T002',
                  name: 'pH值测定',
                  status: 'testing',
                  statusText: '检测中',
                  startTime: '2025-01-22 10:00:00',
                  operator: '王检测师',
                },
              ],
            },
            {
              id: 'S002',
              name: '工业废水样本B',
              type: 'water',
              typeText: '水质样本',
              quantity: 1.5,
              unit: 'L',
              description: '来自污水处理设施的出水样本',
              status: 'pending',
              statusText: '待检测',
              testItems: [
                {
                  id: 'T003',
                  name: '溶解氧测定',
                  status: 'pending',
                  statusText: '待检测',
                },
              ],
            },
          ],
          status: 'testing',
          statusText: '检测中',
          urgency: 'urgent',
          urgencyText: '紧急',
          submittedAt: '2025-01-20 09:30:00',
          expectedDate: '2025-01-25',
          progress: 65,
          reportDelivery: 'electronic',
          specialRequirements: '需要加急处理，请在预期时间内完成检测',
          timeline: [
            {
              id: '1',
              title: '送检申请提交',
              description: '客户提交送检申请，包含3个水质样本',
              time: '2025-01-20 09:30:00',
              status: 'completed',
              operator: '系统',
            },
            {
              id: '2',
              title: '样本接收确认',
              description: '实验室接收样本，确认样本状态良好',
              time: '2025-01-20 14:20:00',
              status: 'completed',
              operator: '陈接收员',
            },
            {
              id: '3',
              title: '检测任务分配',
              description: '将检测任务分配给相关检测人员',
              time: '2025-01-21 08:45:00',
              status: 'completed',
              operator: '刘主管',
            },
            {
              id: '4',
              title: '开始检测',
              description: '开始进行重金属检测和pH值测定',
              time: '2025-01-21 09:00:00',
              status: 'current',
              operator: '李检测师',
            },
            {
              id: '5',
              title: '检测完成',
              description: '完成所有检测项目',
              time: '预计 2025-01-24 17:00:00',
              status: 'pending',
            },
            {
              id: '6',
              title: '报告编制',
              description: '编制检测报告',
              time: '预计 2025-01-25 12:00:00',
              status: 'pending',
            },
            {
              id: '7',
              title: '报告交付',
              description: '向客户交付检测报告',
              time: '预计 2025-01-25 17:00:00',
              status: 'pending',
            },
          ],
        }

        setSubmission(mockData)
      } catch (error) {
        console.error('获取送检详情失败:', error)
        toast.error('获取送检详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSubmissionDetail()
    }
  }, [id])

  /**
   * 获取状态样式
   * @param status 状态
   * @returns CSS类名
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'received':
        return 'bg-blue-100 text-blue-800'
      case 'testing':
        return 'bg-purple-100 text-purple-800'
      case 'reporting':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * 获取紧急程度样式
   * @param urgency 紧急程度
   * @returns CSS类名
   */
  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * 获取时间线图标
   * @param status 状态
   * @returns 图标组件
   */
  const getTimelineIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-600' />
      case 'current':
        return <Activity className='w-5 h-5 text-blue-600' />
      case 'pending':
        return <Clock className='w-5 h-5 text-gray-400' />
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>加载中...</span>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className='text-center py-12'>
        <XCircle className='mx-auto h-12 w-12 text-gray-400' />
        <h3 className='mt-2 text-sm font-medium text-gray-900'>
          未找到送检记录
        </h3>
        <p className='mt-1 text-sm text-gray-500'>请检查送检编号是否正确</p>
        <div className='mt-6'>
          <button
            onClick={() => navigate('/submission')}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题和操作 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/submission')}
            className='p-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>送检详情</h1>
            <p className='text-gray-600 mt-1'>送检编号：{submission.id}</p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          {submission.status !== 'completed' &&
            submission.status !== 'cancelled' && (
              <button
                onClick={() => navigate(`/submission/${submission.id}/edit`)}
                className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                <Edit className='w-4 h-4 mr-2' />
                编辑
              </button>
            )}
          {submission.status === 'completed' && (
            <button
              onClick={() => toast.success('报告下载功能开发中')}
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              <Download className='w-4 h-4 mr-2' />
              下载报告
            </button>
          )}
        </div>
      </div>

      {/* 状态卡片 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyle(
                submission.status
              )}`}
            >
              {submission.statusText}
            </span>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyStyle(
                submission.urgency
              )}`}
            >
              {submission.urgencyText}
            </span>
          </div>
          <div className='text-right'>
            <div className='text-sm text-gray-500'>完成进度</div>
            <div className='flex items-center space-x-2 mt-1'>
              <div className='w-32 bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${submission.progress}%` }}
                ></div>
              </div>
              <span className='text-sm font-medium text-gray-900'>
                {submission.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8 px-6'>
            {[
              { key: 'overview', label: '基本信息', icon: User },
              { key: 'samples', label: '样本信息', icon: Package },
              { key: 'tests', label: '检测项目', icon: TestTube },
              { key: 'timeline', label: '进度跟踪', icon: Activity },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className='p-6'>
          {/* 基本信息标签页 */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* 客户信息 */}
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    客户信息
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <User className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.clientName}
                        </div>
                        <div className='text-sm text-gray-500'>客户名称</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <User className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.contactPerson}
                        </div>
                        <div className='text-sm text-gray-500'>联系人</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <Phone className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.contactPhone}
                        </div>
                        <div className='text-sm text-gray-500'>联系电话</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <Mail className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.contactEmail}
                        </div>
                        <div className='text-sm text-gray-500'>联系邮箱</div>
                      </div>
                    </div>
                    <div className='flex items-start space-x-3'>
                      <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.clientAddress}
                        </div>
                        <div className='text-sm text-gray-500'>客户地址</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 送检信息 */}
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    送检信息
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <Calendar className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.submittedAt}
                        </div>
                        <div className='text-sm text-gray-500'>提交时间</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <Clock className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.expectedDate}
                        </div>
                        <div className='text-sm text-gray-500'>
                          预期完成时间
                        </div>
                      </div>
                    </div>
                    {submission.actualDate && (
                      <div className='flex items-center space-x-3'>
                        <CheckCircle className='w-5 h-5 text-green-500' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {submission.actualDate}
                          </div>
                          <div className='text-sm text-gray-500'>
                            实际完成时间
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='flex items-center space-x-3'>
                      <Package className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.sampleCount} 个样本
                        </div>
                        <div className='text-sm text-gray-500'>样本数量</div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <FileText className='w-5 h-5 text-gray-400' />
                      <div>
                        <div className='font-medium text-gray-900'>
                          {submission.reportDelivery === 'electronic'
                            ? '电子版'
                            : submission.reportDelivery === 'paper'
                              ? '纸质版'
                              : '电子版+纸质版'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          报告交付方式
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 特殊要求 */}
              {submission.specialRequirements && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    特殊要求
                  </h3>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <p className='text-gray-700'>
                      {submission.specialRequirements}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 样本信息标签页 */}
          {activeTab === 'samples' && (
            <div className='space-y-6'>
              {submission.samples.map((sample, index) => (
                <div
                  key={sample.id}
                  className='border border-gray-200 rounded-lg p-6'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      样本 {index + 1}: {sample.name}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        sample.status
                      )}`}
                    >
                      {sample.statusText}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div>
                      <div className='text-sm text-gray-500'>样本类型</div>
                      <div className='font-medium text-gray-900'>
                        {sample.typeText}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-500'>样本数量</div>
                      <div className='font-medium text-gray-900'>
                        {sample.quantity} {sample.unit}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-500'>检测项目数</div>
                      <div className='font-medium text-gray-900'>
                        {sample.testItems.length} 项
                      </div>
                    </div>
                  </div>

                  {sample.description && (
                    <div className='mb-4'>
                      <div className='text-sm text-gray-500 mb-1'>样本描述</div>
                      <div className='text-gray-700'>{sample.description}</div>
                    </div>
                  )}

                  <div>
                    <div className='text-sm text-gray-500 mb-2'>检测项目</div>
                    <div className='space-y-2'>
                      {sample.testItems.map(item => (
                        <div
                          key={item.id}
                          className='flex items-center justify-between p-3 bg-gray-50 rounded-md'
                        >
                          <div className='flex items-center space-x-3'>
                            <TestTube className='w-4 h-4 text-gray-400' />
                            <span className='font-medium text-gray-900'>
                              {item.name}
                            </span>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {item.statusText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 检测项目标签页 */}
          {activeTab === 'tests' && (
            <div className='space-y-6'>
              {submission.samples.map(sample => (
                <div key={sample.id}>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    {sample.name} - 检测项目
                  </h3>
                  <div className='space-y-4'>
                    {sample.testItems.map(item => (
                      <div
                        key={item.id}
                        className='border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center space-x-3'>
                            <TestTube className='w-5 h-5 text-gray-400' />
                            <h4 className='font-medium text-gray-900'>
                              {item.name}
                            </h4>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {item.statusText}
                          </span>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
                          {item.startTime && (
                            <div>
                              <div className='text-gray-500'>开始时间</div>
                              <div className='font-medium text-gray-900'>
                                {item.startTime}
                              </div>
                            </div>
                          )}
                          {item.endTime && (
                            <div>
                              <div className='text-gray-500'>完成时间</div>
                              <div className='font-medium text-gray-900'>
                                {item.endTime}
                              </div>
                            </div>
                          )}
                          {item.operator && (
                            <div>
                              <div className='text-gray-500'>操作人员</div>
                              <div className='font-medium text-gray-900'>
                                {item.operator}
                              </div>
                            </div>
                          )}
                          {item.result && (
                            <div>
                              <div className='text-gray-500'>检测结果</div>
                              <div className='font-medium text-gray-900'>
                                {item.result}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 进度跟踪标签页 */}
          {activeTab === 'timeline' && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-6'>
                进度时间线
              </h3>
              <div className='flow-root'>
                <ul className='-mb-8'>
                  {submission.timeline.map((item, index) => (
                    <li key={item.id}>
                      <div className='relative pb-8'>
                        {index !== submission.timeline.length - 1 && (
                          <span
                            className='absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200'
                            aria-hidden='true'
                          />
                        )}
                        <div className='relative flex space-x-3'>
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                item.status === 'completed'
                                  ? 'bg-green-500'
                                  : item.status === 'current'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                              }`}
                            >
                              {getTimelineIcon(item.status)}
                            </span>
                          </div>
                          <div className='min-w-0 flex-1 pt-1.5'>
                            <div>
                              <p className='text-sm font-medium text-gray-900'>
                                {item.title}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {item.description}
                              </p>
                            </div>
                            <div className='mt-2 text-sm text-gray-500'>
                              <time>{item.time}</time>
                              {item.operator && (
                                <span className='ml-2'>· {item.operator}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetail
