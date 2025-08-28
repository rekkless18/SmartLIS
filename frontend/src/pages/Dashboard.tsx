/**
 * 首页看板页面
 * 显示系统概览数据、统计图表、快捷操作等
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  TestTube,
  Microscope,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/auth'

/**
 * 统计卡片数据接口
 */
interface StatCard {
  title: string
  value: number
  change: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
}

/**
 * 首页看板组件
 * @returns 看板页面
 */
const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // 模拟统计数据
  const [stats] = useState<StatCard[]>([
    {
      title: '今日送检',
      value: 24,
      change: 12,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: '待处理样本',
      value: 156,
      change: -8,
      icon: TestTube,
      color: 'bg-green-500',
    },
    {
      title: '进行中实验',
      value: 32,
      change: 5,
      icon: Microscope,
      color: 'bg-purple-500',
    },
    {
      title: '待审核报告',
      value: 18,
      change: -3,
      icon: FileCheck,
      color: 'bg-orange-500',
    },
  ])

  // 模拟最近活动数据
  const [recentActivities] = useState([
    {
      id: '1',
      type: 'submission',
      title: '新送检申请 #SJ2025001',
      description: '客户ABC公司提交了新的检测申请',
      time: '2分钟前',
      status: 'pending',
    },
    {
      id: '2',
      type: 'experiment',
      title: '实验完成 #EXP2025001',
      description: '质谱实验已完成，等待数据审核',
      time: '15分钟前',
      status: 'completed',
    },
    {
      id: '3',
      type: 'report',
      title: '报告审核通过 #RPT2025001',
      description: '检测报告已通过审核，可以交付',
      time: '1小时前',
      status: 'approved',
    },
    {
      id: '4',
      type: 'alert',
      title: '设备维护提醒',
      description: '质谱仪MS-001需要进行定期维护',
      time: '2小时前',
      status: 'warning',
    },
  ])

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  /**
   * 获取状态图标
   * @param status 状态
   * @returns 图标组件
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='w-4 h-4 text-yellow-500' />
      case 'completed':
      case 'approved':
        return <CheckCircle className='w-4 h-4 text-green-500' />
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-orange-500' />
      default:
        return <Clock className='w-4 h-4 text-gray-500' />
    }
  }

  /**
   * 处理快捷操作点击
   * @param action 操作类型
   */
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'submission':
        navigate('/submission/create')
        break
      case 'sample':
        navigate('/sample/receive')
        break
      case 'experiment':
        navigate('/general-experiment/list')
        break
      case 'report':
        navigate('/report')
        break
      default:
        console.warn('未知的快捷操作:', action)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          欢迎回来，{user?.realName || user?.username}！
        </h1>
        <p className='text-gray-600 mt-1'>
          今天是{' '}
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900 mt-1'>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className='w-6 h-6 text-white' />
                </div>
              </div>
              <div className='flex items-center mt-4'>
                <TrendingUp
                  className={`w-4 h-4 ${
                    stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                />
                <span
                  className={`text-sm font-medium ml-1 ${
                    stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change >= 0 ? '+' : ''}
                  {stat.change}%
                </span>
                <span className='text-sm text-gray-600 ml-1'>较昨日</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 最近活动 */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>最近活动</h2>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {recentActivities.map(activity => (
                <div key={activity.id} className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 mt-1'>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      {activity.title}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      {activity.description}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>快捷操作</h2>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-4'>
              <button 
                onClick={() => handleQuickAction('submission')}
                className='flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
              >
                <FileText className='w-8 h-8 text-blue-500 mb-2' />
                <span className='text-sm font-medium text-gray-700'>
                  新建送检
                </span>
              </button>
              <button 
                onClick={() => handleQuickAction('sample')}
                className='flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors'
              >
                <TestTube className='w-8 h-8 text-green-500 mb-2' />
                <span className='text-sm font-medium text-gray-700'>
                  样本接收
                </span>
              </button>
              <button 
                onClick={() => handleQuickAction('experiment')}
                className='flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors'
              >
                <Microscope className='w-8 h-8 text-purple-500 mb-2' />
                <span className='text-sm font-medium text-gray-700'>
                  开始实验
                </span>
              </button>
              <button 
                onClick={() => handleQuickAction('report')}
                className='flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors'
              >
                <FileCheck className='w-8 h-8 text-orange-500 mb-2' />
                <span className='text-sm font-medium text-gray-700'>
                  生成报告
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
