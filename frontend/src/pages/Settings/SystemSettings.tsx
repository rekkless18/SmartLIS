/**
 * 系统设置页面
 * 配置系统参数、通知设置、系统日志、数据导入导出等
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  Settings,
  Bell,
  FileText,
  Download,
  Upload,
  Save,
  RefreshCw,
  Database,
  Mail,
  Smartphone,
  Globe,
  Shield,
  Clock,
  HardDrive,
} from 'lucide-react'
import DataTable from '../../components/DataTable'

/**
 * 系统配置接口
 */
interface SystemConfig {
  id: string
  category: string
  key: string
  name: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  description: string
}

/**
 * 通知设置接口
 */
interface NotificationSetting {
  id: string
  type: string
  name: string
  email: boolean
  sms: boolean
  system: boolean
  description: string
}

/**
 * 系统日志接口
 */
interface SystemLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  module: string
  message: string
  user: string
  ip: string
  timestamp: string
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false) // 改为false，直接显示内容
  const [saving, setSaving] = useState(false)

  // 模拟系统配置数据
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([
    {
      id: '1',
      category: '基础配置',
      key: 'system.name',
      name: '系统名称',
      value: 'SmartLis 智能实验室管理系统',
      type: 'text',
      description: '系统显示名称',
    },
    {
      id: '2',
      category: '基础配置',
      key: 'system.version',
      name: '系统版本',
      value: '1.0.0',
      type: 'text',
      description: '当前系统版本号',
    },
    {
      id: '3',
      category: '基础配置',
      key: 'system.timezone',
      name: '时区设置',
      value: 'Asia/Shanghai',
      type: 'select',
      options: ['Asia/Shanghai', 'UTC', 'America/New_York', 'Europe/London'],
      description: '系统默认时区',
    },
  ])

  // 模拟通知设置数据
  const [notificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      type: 'sample_received',
      name: '样本接收通知',
      email: true,
      sms: false,
      system: true,
      description: '当有新样本接收时发送通知',
    },
    {
      id: '2',
      type: 'experiment_completed',
      name: '实验完成通知',
      email: true,
      sms: true,
      system: true,
      description: '当实验完成时发送通知',
    },
  ])

  // 模拟系统日志数据
  const [systemLogs] = useState<SystemLog[]>([
    {
      id: '1',
      level: 'info',
      module: '用户管理',
      message: '用户 admin 登录系统',
      user: 'admin',
      ip: '192.168.1.100',
      timestamp: '2025-01-25 14:30:00',
    },
    {
      id: '2',
      level: 'warn',
      module: '样本管理',
      message: '样本 S2025001 接收超时',
      user: 'lab_manager',
      ip: '192.168.1.101',
      timestamp: '2025-01-25 14:25:00',
    },
  ])

  /**
   * 获取日志级别颜色
   * @param level 级别
   * @returns 颜色类名
   */
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'warn':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'debug':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * 处理配置保存
   */
  const handleSaveConfig = async () => {
    setSaving(true)
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    // 这里可以添加成功提示
  }

  /**
   * 处理配置值更改
   * @param id 配置ID
   * @param value 新值
   */
  const handleConfigChange = (id: string, value: string) => {
    setSystemConfigs(prev =>
      prev.map(config => (config.id === id ? { ...config, value } : config))
    )
  }

  /**
   * 处理数据导出
   */
  const handleExportData = () => {
    // 模拟数据导出
    console.log('导出数据...')
  }

  /**
   * 处理数据导入
   */
  const handleImportData = () => {
    // 模拟数据导入
    console.log('导入数据...')
  }

  // 系统日志表格列配置
  const logColumns = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(value)}`}
        >
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
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
        <h1 className='text-2xl font-bold text-gray-900'>系统设置</h1>
        <p className='text-gray-600 mt-1'>配置系统参数、通知设置和数据管理</p>
      </div>

      {/* 标签页导航 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基础配置
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            通知设置
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            系统日志
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            数据管理
          </button>
        </nav>
      </div>

      {/* 基础配置标签页 */}
      {activeTab === 'basic' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>基础配置</h2>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50'
            >
              <Save className='w-4 h-4' />
              <span>{saving ? '保存中...' : '保存配置'}</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <div className='p-6 space-y-6'>
              {systemConfigs.map(config => (
                <div key={config.id} className='grid grid-cols-1 md:grid-cols-3 gap-4 items-center'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      {config.name}
                    </label>
                    <p className='text-sm text-gray-500 mt-1'>
                      {config.description}
                    </p>
                  </div>
                  <div className='md:col-span-2'>
                    {config.type === 'text' && (
                      <input
                        type='text'
                        value={config.value}
                        onChange={(e) => handleConfigChange(config.id, e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    )}
                    {config.type === 'number' && (
                      <input
                        type='number'
                        value={config.value}
                        onChange={(e) => handleConfigChange(config.id, e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    )}
                    {config.type === 'boolean' && (
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={config.value === 'true'}
                          onChange={(e) => handleConfigChange(config.id, e.target.checked.toString())}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='ml-2 text-sm text-gray-700'>启用</span>
                      </label>
                    )}
                    {config.type === 'select' && (
                      <select
                        value={config.value}
                        onChange={(e) => handleConfigChange(config.id, e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {config.options?.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 通知设置标签页 */}
      {activeTab === 'notifications' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>通知设置</h2>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
              <Save className='w-4 h-4' />
              <span>保存设置</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='grid grid-cols-4 gap-4 text-sm font-medium text-gray-700'>
                <div>通知类型</div>
                <div className='flex items-center space-x-1'>
                  <Mail className='w-4 h-4' />
                  <span>邮件</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <Smartphone className='w-4 h-4' />
                  <span>短信</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <Bell className='w-4 h-4' />
                  <span>系统</span>
                </div>
              </div>
            </div>
            <div className='divide-y divide-gray-200'>
              {notificationSettings.map(setting => (
                <div key={setting.id} className='px-6 py-4'>
                  <div className='grid grid-cols-4 gap-4 items-center'>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {setting.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {setting.description}
                      </div>
                    </div>
                    <div className='flex justify-center'>
                      <input
                        type='checkbox'
                        checked={setting.email}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <input
                        type='checkbox'
                        checked={setting.sms}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <input
                        type='checkbox'
                        checked={setting.system}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 系统日志标签页 */}
      {activeTab === 'logs' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>系统日志</h2>
            <div className='flex space-x-2'>
              <button className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2'>
                <RefreshCw className='w-4 h-4' />
                <span>刷新</span>
              </button>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
                <Download className='w-4 h-4' />
                <span>导出日志</span>
              </button>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={logColumns}
              dataSource={systemLogs}
              pagination={{
                current: 1,
                pageSize: 10,
                total: systemLogs.length,
              }}
            />
          </div>
        </div>
      )}

      {/* 数据管理标签页 */}
      {activeTab === 'data' && (
        <div className='space-y-6'>
          <h2 className='text-lg font-semibold text-gray-900'>数据导入导出</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 数据导出 */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='bg-blue-100 p-2 rounded-lg'>
                  <Download className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    数据导出
                  </h3>
                  <p className='text-sm text-gray-600'>导出系统数据到文件</p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>用户数据</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>样本数据</span>
                </div>
              </div>

              <button
                onClick={handleExportData}
                className='w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2'
              >
                <Download className='w-4 h-4' />
                <span>开始导出</span>
              </button>
            </div>

            {/* 数据导入 */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='bg-green-100 p-2 rounded-lg'>
                  <Upload className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    数据导入
                  </h3>
                  <p className='text-sm text-gray-600'>从文件导入数据到系统</p>
                </div>
              </div>

              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-600 mb-2'>
                  拖拽文件到此处或点击选择
                </p>
                <p className='text-xs text-gray-500'>支持 CSV, Excel 格式</p>
              </div>

              <button
                onClick={handleImportData}
                className='w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2'
              >
                <Upload className='w-4 h-4' />
                <span>开始导入</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemSettings
