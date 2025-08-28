/**
 * 主布局组件
 * 包含侧边栏导航、顶部导航栏、主内容区域
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  FileText,
  TestTube,
  Microscope,
  FileCheck,
  Building,
  Thermometer,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  UserCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/auth'
import { cn } from '../lib/utils'

/**
 * 侧边栏菜单项配置
 */
const menuItems = [
  {
    path: '/dashboard',
    label: '首页看板',
    icon: Home,
    permission: 'dashboard.view',
  },
  {
    path: '/submission',
    label: '送检管理',
    icon: FileText,
    permission: 'submission.list',
    children: [
      {
        path: '/submission',
        label: '送检列表',
        permission: 'submission.list',
      },
      {
        path: '/submission/create',
        label: '新建送检',
        permission: 'submission.create',
      },
    ],
  },
  {
    path: '/sample',
    label: '样本管理',
    icon: TestTube,
    permission: 'sample.list',
    children: [
      {
        path: '/sample',
        label: '样本列表',
        permission: 'sample.list',
      },
      {
        path: '/sample/receive',
        label: '样本接收',
        permission: 'sample.receive',
      },
      {
        path: '/sample/storage',
        label: '样本出入库',
        permission: 'sample.storage',
      },
      {
        path: '/sample/destroy',
        label: '样本销毁',
        permission: 'sample.destroy',
      },
    ],
  },
  {
    path: '/general-experiment',
    label: '普检实验管理',
    icon: Microscope,
    permission: 'routine.list',
    children: [
      {
        path: '/general-experiment/list',
        label: '普检实验列表',
        permission: 'routine.list',
      },
      {
        path: '/general-experiment/data-entry',
        label: '普检数据录入',
        permission: 'routine.data_entry',
      },
      {
        path: '/general-experiment/data-review',
        label: '普检数据审核',
        permission: 'routine.data_review',
      },
      {
        path: '/general-experiment/exception-handle',
        label: '普检异常处理',
        permission: 'routine.exception',
      },
    ],
  },
  {
    path: '/mass-spec',
    label: '质谱实验管理',
    icon: TestTube,
    permission: 'mass_spec.list',
    children: [
      {
        path: '/mass-spec/list',
        label: '质谱实验列表',
        permission: 'mass_spec.list',
      },
      {
        path: '/mass-spec/data-entry',
        label: '质谱数据录入',
        permission: 'mass_spec.data_entry',
      },
      {
        path: '/mass-spec/data-review',
        label: '质谱数据审核',
        permission: 'mass_spec.data_review',
      },
      {
        path: '/mass-spec/quality-control',
        label: '质控管理',
        permission: 'mass_spec.qc',
      },
    ],
  },
  {
    path: '/special-experiment',
    label: '特检实验管理',
    icon: Building,
    permission: 'special.list',
    children: [
      {
        path: '/special-experiment/wet-lab',
        label: '湿实验管理',
        permission: 'special.wet_lab',
      },
      {
        path: '/special-experiment/machine-operation',
        label: '上机管理',
        permission: 'special.instrument',
      },
      {
        path: '/special-experiment/analysis-interpretation',
        label: '分析解读',
        permission: 'special.analysis',
      },
      {
        path: '/special-experiment/exception-center',
        label: '特检异常中心',
        permission: 'special.exception',
      },
    ],
  },
  {
    path: '/report',
    label: '报告管理',
    icon: FileCheck,
    permission: 'report.list',
    children: [
      {
        path: '/report/list',
        label: '报告列表',
        permission: 'report.list',
      },
      {
        path: '/report/create',
        label: '新建报告',
        permission: 'report.edit',
      },
      {
        path: '/report/review',
        label: '报告审核',
        permission: 'report.review',
      },
      {
        path: '/report/template',
        label: '报告模板',
        permission: 'report.template',
      },
    ],
  },
  {
    path: '/lab',
    label: '实验室管理',
    icon: Building,
    permission: 'lab.equipment',
    children: [
      {
        path: '/lab/management',
        label: '实验室管理',
        permission: 'lab.equipment',
      },
      {
        path: '/lab/equipment',
        label: '设备管理',
        permission: 'lab.equipment',
      },
      {
        path: '/lab/supplies',
        label: '耗材管理',
        permission: 'lab.consumables',
      },
      {
        path: '/lab/booking',
        label: '预约管理',
        permission: 'lab.reservation',
      },
    ],
  },
  {
    path: '/environment',
    label: '环境管理',
    icon: Thermometer,
    permission: 'environment.monitoring',
    children: [
      {
        path: '/environment/monitor',
        label: '环境监控',
        permission: 'environment.monitoring',
      },
    ],
  },
  {
    path: '/user',
    label: '用户管理',
    icon: Users,
    permission: 'user.list',
    children: [
      {
        path: '/user/account',
        label: '账号管理',
        permission: 'user.list',
      },
      {
        path: '/user/role',
        label: '角色管理',
        permission: 'role.list',
      },
    ],
  },
  {
    path: '/settings',
    label: '系统设置',
    icon: Settings,
    permission: 'settings.basic',
    children: [
      {
        path: '/settings/system',
        label: '系统设置',
        permission: 'settings.basic',
      },
    ],
  },
]

/**
 * 主布局组件
 * @returns 布局组件
 */
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user, logout, hasPermission } = useAuthStore()

  // 添加调试日志
  console.log('=== Layout Debug Info ===')
  console.log('Current user:', user)
  console.log('User permissions:', user?.permissions)
  console.log('User roles:', user?.roles)
  console.log('Is authenticated:', !!user)

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    logout()
  }

  /**
   * 检查菜单项是否激活
   * @param path 菜单路径
   * @returns 是否激活
   */
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  /**
   * 切换菜单展开状态
   * @param path 菜单路径
   */
  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    )
  }

  /**
   * 检查菜单是否展开
   * @param path 菜单路径
   * @returns 是否展开
   */
  const isExpanded = (path: string) => {
    return expandedMenus.includes(path)
  }

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 侧边栏头部 */}
        <div className='flex items-center justify-between h-16 px-4 border-b'>
          <h1 className='text-xl font-bold text-gray-800'>SmartLIS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden p-2 rounded-md hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]'>
          {menuItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            const expanded = isExpanded(item.path)

            // 检查权限并添加调试日志
            const hasItemPermission = hasPermission(item.permission)
            console.log(`Menu item "${item.label}" (${item.permission}):`, hasItemPermission)
            
            if (!hasItemPermission) {
              console.log(`Hiding menu item: ${item.label} - No permission: ${item.permission}`)
              return null
            }
            
            console.log(`Showing menu item: ${item.label} - Has permission: ${item.permission}`)

            // 如果是首页看板，直接渲染链接
            if (item.path === '/dashboard') {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className='w-5 h-5 mr-3' />
                  {item.label}
                </Link>
              )
            }

            // 有子菜单的一级菜单
            return (
              <div key={item.path} className='space-y-1'>
                {/* 一级菜单 */}
                <button
                  onClick={() => toggleMenu(item.path)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <div className='flex items-center'>
                    <Icon className='w-5 h-5 mr-3' />
                    {item.label}
                  </div>
                  {expanded ? (
                    <ChevronDown className='w-4 h-4' />
                  ) : (
                    <ChevronRight className='w-4 h-4' />
                  )}
                </button>

                {/* 二级菜单 */}
                {expanded && item.children && (
                  <div className='ml-6 space-y-1'>
                    {item.children.map(child => {
                      const childActive = location.pathname === child.path

                      // 检查子菜单权限并添加调试日志
                      const hasChildPermission = hasPermission(child.permission)
                      console.log(`  Child menu "${child.label}" (${child.permission}):`, hasChildPermission)
                      
                      if (!hasChildPermission) {
                        console.log(`  Hiding child menu: ${child.label} - No permission: ${child.permission}`)
                        return null
                      }
                      
                      console.log(`  Showing child menu: ${child.label} - Has permission: ${child.permission}`)

                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center px-3 py-2 rounded-md text-sm transition-colors',
                            childActive
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          )}
                        >
                          <div className='w-2 h-2 bg-gray-400 rounded-full mr-3' />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* 主内容区域 */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* 顶部导航栏 */}
        <header className='bg-white shadow-sm border-b'>
          <div className='flex items-center justify-between h-16 px-4'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='lg:hidden p-2 rounded-md hover:bg-gray-100'
            >
              <Menu className='w-5 h-5' />
            </button>

            <div className='flex-1' />

            {/* 右侧用户菜单 */}
            <div className='relative' ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className='flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors'
              >
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                  <User className='w-4 h-4 text-white' />
                </div>
                <div className='hidden md:block text-left'>
                  <p className='text-sm font-medium text-gray-900'>
                    {user?.realName || user?.username}
                  </p>
                  <p className='text-xs text-gray-500'>{user?.email}</p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50'>
                  <Link
                    to='/profile'
                    onClick={() => setUserMenuOpen(false)}
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                  >
                    <UserCircle className='w-4 h-4 mr-3' />
                    个人中心
                  </Link>
                  <hr className='my-1 border-gray-200' />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleLogout()
                    }}
                    className='w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                  >
                    <LogOut className='w-4 h-4 mr-3' />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className='flex-1 overflow-auto p-6'>
          <Outlet />
        </main>
      </div>

      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
