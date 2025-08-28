/**
 * 环境监控页面
 * 监控实验室环境参数，包括温度、湿度、压力等
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Settings,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import DataTable from '../../components/DataTable'

/**
 * 环境参数接口
 */
interface EnvironmentData {
  id: string
  location: string
  temperature: number
  humidity: number
  pressure: number
  airQuality: number
  status: 'normal' | 'warning' | 'critical'
  lastUpdate: string
}

/**
 * 传感器接口
 */
interface Sensor {
  id: string
  name: string
  type: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
  lastMaintenance: string
  nextMaintenance: string
}

/**
 * 报警记录接口
 */
interface Alert {
  id: string
  type: string
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
  location: string
  time: string
  status: 'active' | 'resolved' | 'acknowledged'
}

const EnvironmentMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor')
  const [loading, setLoading] = useState(true)

  // 模拟环境数据
  const [environmentData] = useState<EnvironmentData[]>([
    {
      id: '1',
      location: '实验室A',
      temperature: 22.5,
      humidity: 45.2,
      pressure: 1013.2,
      airQuality: 95,
      status: 'normal',
      lastUpdate: '2025-01-25 14:30:00',
    },
    {
      id: '2',
      location: '实验室B',
      temperature: 25.8,
      humidity: 52.1,
      pressure: 1012.8,
      airQuality: 88,
      status: 'warning',
      lastUpdate: '2025-01-25 14:29:45',
    },
    {
      id: '3',
      location: '样本储存室',
      temperature: 4.2,
      humidity: 38.5,
      pressure: 1014.1,
      airQuality: 98,
      status: 'normal',
      lastUpdate: '2025-01-25 14:30:15',
    },
  ])

  // 模拟传感器数据
  const [sensors] = useState<Sensor[]>([
    {
      id: '1',
      name: '温湿度传感器-001',
      type: '温湿度',
      location: '实验室A',
      status: 'online',
      lastMaintenance: '2024-12-15',
      nextMaintenance: '2025-03-15',
    },
    {
      id: '2',
      name: '压力传感器-001',
      type: '压力',
      location: '实验室A',
      status: 'online',
      lastMaintenance: '2024-11-20',
      nextMaintenance: '2025-02-20',
    },
    {
      id: '3',
      name: '空气质量传感器-001',
      type: '空气质量',
      location: '实验室B',
      status: 'maintenance',
      lastMaintenance: '2025-01-20',
      nextMaintenance: '2025-04-20',
    },
  ])

  // 模拟报警数据
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: '温度异常',
      level: 'medium',
      message: '实验室B温度超出正常范围（25.8°C > 25°C）',
      location: '实验室B',
      time: '2025-01-25 14:25:00',
      status: 'active',
    },
    {
      id: '2',
      type: '传感器离线',
      level: 'high',
      message: '空气质量传感器-001离线超过30分钟',
      location: '实验室B',
      time: '2025-01-25 14:00:00',
      status: 'acknowledged',
    },
    {
      id: '3',
      type: '湿度异常',
      level: 'low',
      message: '样本储存室湿度偏低（38.5% < 40%）',
      location: '样本储存室',
      time: '2025-01-25 13:45:00',
      status: 'resolved',
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
   * 获取状态颜色
   * @param status 状态
   * @returns 颜色类名
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'online':
      case 'resolved':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'acknowledged':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'offline':
      case 'active':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * 获取报警级别颜色
   * @param level 级别
   * @returns 颜色类名
   */
  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-blue-600 bg-blue-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // 传感器表格列配置
  const sensorColumns = [
    {
      title: '传感器名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
        >
          {value === 'online'
            ? '在线'
            : value === 'offline'
              ? '离线'
              : '维护中'}
        </span>
      ),
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
    },
    {
      title: '操作',
      key: 'actions',
      render: (value: any, record: Sensor) => (
        <div className='flex space-x-2'>
          <button className='text-blue-600 hover:text-blue-800 text-sm'>
            配置
          </button>
          <button className='text-green-600 hover:text-green-800 text-sm'>
            维护
          </button>
        </div>
      ),
    },
  ]

  // 报警表格列配置
  const alertColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertLevelColor(value)}`}
        >
          {value === 'low'
            ? '低'
            : value === 'medium'
              ? '中'
              : value === 'high'
                ? '高'
                : '严重'}
        </span>
      ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
        >
          {value === 'active'
            ? '活跃'
            : value === 'resolved'
              ? '已解决'
              : '已确认'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (value: any, record: Alert) => (
        <div className='flex space-x-2'>
          {record.status === 'active' && (
            <>
              <button className='text-blue-600 hover:text-blue-800 text-sm'>
                确认
              </button>
              <button className='text-green-600 hover:text-green-800 text-sm'>
                解决
              </button>
            </>
          )}
          <button className='text-gray-600 hover:text-gray-800 text-sm'>
            详情
          </button>
        </div>
      ),
    },
  ]

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
        <h1 className='text-2xl font-bold text-gray-900'>环境监控</h1>
        <p className='text-gray-600 mt-1'>监控实验室环境参数和设备状态</p>
      </div>

      {/* 标签页导航 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            环境监控
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sensors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            传感器管理
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            报警设置
          </button>
        </nav>
      </div>

      {/* 环境监控标签页 */}
      {activeTab === 'monitor' && (
        <div className='space-y-6'>
          {/* 环境参数卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {environmentData.map(data => (
              <div key={data.id} className='bg-white rounded-lg shadow p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {data.location}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
                  >
                    {data.status === 'normal'
                      ? '正常'
                      : data.status === 'warning'
                        ? '警告'
                        : '严重'}
                  </span>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Thermometer className='w-4 h-4 text-red-500' />
                      <span className='text-sm text-gray-600'>温度</span>
                    </div>
                    <span className='text-lg font-semibold text-gray-900'>
                      {data.temperature}°C
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Droplets className='w-4 h-4 text-blue-500' />
                      <span className='text-sm text-gray-600'>湿度</span>
                    </div>
                    <span className='text-lg font-semibold text-gray-900'>
                      {data.humidity}%
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Gauge className='w-4 h-4 text-purple-500' />
                      <span className='text-sm text-gray-600'>压力</span>
                    </div>
                    <span className='text-lg font-semibold text-gray-900'>
                      {data.pressure} hPa
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Wind className='w-4 h-4 text-green-500' />
                      <span className='text-sm text-gray-600'>空气质量</span>
                    </div>
                    <span className='text-lg font-semibold text-gray-900'>
                      {data.airQuality}%
                    </span>
                  </div>
                </div>

                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <p className='text-xs text-gray-500'>
                    最后更新：{data.lastUpdate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 传感器管理标签页 */}
      {activeTab === 'sensors' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>传感器列表</h2>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
              添加传感器
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={sensorColumns}
              data={sensors}
              pagination={{
                current: 1,
                pageSize: 10,
                total: sensors.length,
              }}
            />
          </div>
        </div>
      )}

      {/* 报警设置标签页 */}
      {activeTab === 'alerts' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>报警记录</h2>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
              报警设置
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={alertColumns}
              data={alerts}
              pagination={{
                current: 1,
                pageSize: 10,
                total: alerts.length,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvironmentMonitor
