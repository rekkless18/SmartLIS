/**
 * 账号管理页面
 * 管理系统用户账号的增删改查
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { UserPlus, Search, Filter } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { UserService, RoleService } from '../../services'
import type { User, Role } from '../../services/userService'
import { toast } from 'sonner'

// 接口定义已移至services中

const AccountManagement: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formData, setFormData] = useState({
    username: '',
    real_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    password: '',
    confirmPassword: '',
    roleIds: [] as string[]
  })
  const [formLoading, setFormLoading] = useState(false)

  /**
   * 加载用户数据
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchTerm,
        status: statusFilter
      }
      const response = await UserService.getUsers(params)
      setUsers(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || response.total || 0
      }))
    } catch (error) {
      console.error('加载用户数据失败:', error)
      toast.error('加载用户数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载角色数据
   */
  const loadRoles = async () => {
    try {
      const response = await RoleService.getRoles()
      setRoles(response.data)
    } catch (error) {
      console.error('加载角色数据失败:', error)
      toast.error('加载角色数据失败')
    }
  }

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [pagination.current, pagination.pageSize, searchTerm, statusFilter])

  useEffect(() => {
    // 重置到第一页当搜索条件改变时
    if (pagination.current !== 1) {
      setPagination(prev => ({ ...prev, current: 1 }))
    }
  }, [searchTerm, statusFilter])

  /**
   * 获取状态颜色
   * @param status 状态
   * @returns 颜色类名
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      case 'locked':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * 获取状态文本
   * @param status 状态
   * @returns 状态文本
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃'
      case 'inactive':
        return '非活跃'
      case 'locked':
        return '锁定'
      default:
        return '未知'
    }
  }

  /**
   * 处理编辑用户
   * @param user 用户
   */
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      real_name: user.real_name,
      email: user.email,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      password: '',
      confirmPassword: '',
      roleIds: user.roles?.map(role => role.id) || []
    })
    setShowUserModal(true)
  }

  /**
   * 处理新增用户
   */
  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      real_name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      password: '',
      confirmPassword: '',
      roleIds: []
    })
    setShowUserModal(true)
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    try {
      setFormLoading(true)
      
      // 表单验证
      if (!formData.username || !formData.real_name || !formData.email) {
        toast.error('请填写必填字段')
        return
      }
      
      if (!editingUser && (!formData.password || formData.password !== formData.confirmPassword)) {
        toast.error('密码不能为空且两次输入必须一致')
        return
      }
      
      const userData = {
        username: formData.username,
        real_name: formData.real_name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        ...((!editingUser && formData.password) ? { password: formData.password } : {})
      }
      
      if (editingUser) {
        // 更新用户
        await UserService.updateUser(editingUser.id, userData)
        
        // 更新用户角色
        if (formData.roleIds.length > 0) {
          await UserService.assignUserRoles(editingUser.id, formData.roleIds)
        }
        
        toast.success('用户更新成功')
      } else {
        // 创建用户
        const newUser = await UserService.createUser(userData)
        
        // 分配角色
        if (formData.roleIds.length > 0) {
          await UserService.assignUserRoles(newUser.id, formData.roleIds)
        }
        
        toast.success('用户创建成功')
      }
      
      setShowUserModal(false)
      setEditingUser(null)
      loadUsers() // 重新加载用户列表
    } catch (error) {
      console.error('保存用户失败:', error)
      toast.error('保存用户失败')
    } finally {
      setFormLoading(false)
    }
  }

  /**
   * 处理表单字段变化
   */
  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * 处理删除用户
   * @param userId 用户ID
   */
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await UserService.deleteUser(userId)
        toast.success('用户删除成功')
        loadUsers() // 重新加载用户列表
      } catch (error) {
        console.error('删除用户失败:', error)
        toast.error('删除用户失败')
      }
    }
  }

  /**
   * 处理重置密码
   * @param userId 用户ID
   */
  const handleResetPassword = async (userId: string) => {
    if (window.confirm('确定要重置这个用户的密码吗？')) {
      try {
        await UserService.resetPassword(userId)
        toast.success('密码重置成功，新密码已发送到用户邮箱')
      } catch (error) {
        console.error('重置密码失败:', error)
        toast.error('重置密码失败')
      }
    }
  }

  /**
   * 处理用户状态切换
   * @param userId 用户ID
   * @param newStatus 新状态
   */
  const handleToggleUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      await UserService.updateUser(userId, { status: newStatus })
      toast.success('用户状态更新成功')
      loadUsers() // 重新加载用户列表
    } catch (error) {
      console.error('更新用户状态失败:', error)
      toast.error('更新用户状态失败')
    }
  }

  /**
   * 过滤用户数据（现在由后端处理，这里只做客户端补充过滤）
   */
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === '' || 
      (user.roles && user.roles.some(role => role.display_name === roleFilter))
    
    return matchesRole
  })

  // 用户表格列配置
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => (
        <div className="flex flex-wrap gap-1">
          {roles?.map(role => (
            <Badge key={role.id} variant="secondary" className="text-xs">
              {role.display_name}
            </Badge>
          )) || '-'}
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string, record: User) => (
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
          >
            {getStatusText(value)}
          </span>
          <select
            value={value}
            onChange={(e) => handleToggleUserStatus(record.id, e.target.value as User['status'])}
            className="text-xs border border-gray-300 rounded px-1 py-0.5"
          >
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="locked">锁定</option>
          </select>
        </div>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (value: string) => value ? new Date(value).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (_value: unknown, record: User) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleEditUser(record)}
            className='text-blue-600 hover:text-blue-800 text-sm'
          >
            编辑
          </button>
          <button 
            onClick={() => handleDeleteUser(record.id)}
            className='text-red-600 hover:text-red-800 text-sm'
          >
            删除
          </button>
          <button 
            onClick={() => handleResetPassword(record.id)}
            className='text-gray-600 hover:text-gray-800 text-sm'
          >
            重置密码
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
        <h1 className='text-2xl font-bold text-gray-900'>账号管理</h1>
        <p className='text-gray-600 mt-1'>管理系统用户账号信息</p>
      </div>

      {/* 搜索和筛选 */}
      <div className='bg-white p-4 rounded-lg shadow space-y-4'>
        <div className='flex flex-wrap gap-4'>
          <div className='flex-1 min-w-64'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='搜索用户名、姓名或邮箱...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
          
          <div className='flex items-center space-x-2'>
            <Filter className='text-gray-400 w-4 h-4' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>所有状态</option>
              <option value='active'>活跃</option>
              <option value='inactive'>非活跃</option>
              <option value='locked'>锁定</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>所有角色</option>
              {roles.map(role => (
                <option key={role.id} value={role.display_name}>
                  {role.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* 用户列表 */}
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-semibold text-gray-900'>
            用户列表 ({filteredUsers.length})
          </h2>
          <button
            onClick={handleAddUser}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
          >
            <UserPlus className='w-4 h-4' />
            <span>添加用户</span>
          </button>
        </div>

        <div className='bg-white rounded-lg shadow'>
          <DataTable
            columns={userColumns}
            dataSource={filteredUsers}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page: number, pageSize: number) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize
                }))
              }
            }}
          />
        </div>
      </div>

      {/* 用户编辑模态框 */}
      <Modal
        open={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setEditingUser(null)
        }}
        title={editingUser ? '编辑用户' : '新增用户'}
        size='large'
      >
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                用户名 <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.username}
                onChange={(e) => handleFormChange('username', e.target.value)}
                placeholder='请输入用户名'
                disabled={!!editingUser} // 编辑时不允许修改用户名
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                真实姓名 <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.real_name}
                onChange={(e) => handleFormChange('real_name', e.target.value)}
                placeholder='请输入真实姓名'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                邮箱 <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder='请输入邮箱地址'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                电话
              </label>
              <input
                type='tel'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder='请输入电话号码'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                部门
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.department}
                onChange={(e) => handleFormChange('department', e.target.value)}
                placeholder='请输入部门'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                职位
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.position}
                onChange={(e) => handleFormChange('position', e.target.value)}
                placeholder='请输入职位'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              角色
            </label>
            <div className='space-y-2'>
              {roles.map(role => (
                <label key={role.id} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={formData.roleIds.includes(role.id)}
                    onChange={(e) => {
                      const newRoleIds = e.target.checked
                        ? [...formData.roleIds, role.id]
                        : formData.roleIds.filter(id => id !== role.id)
                      handleFormChange('roleIds', newRoleIds)
                    }}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>{role.display_name}</span>
                </label>
              ))}
            </div>
          </div>

          {!editingUser && (
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  密码 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder='请输入密码'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  确认密码 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.confirmPassword}
                  onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                  placeholder='请确认密码'
                />
              </div>
            </div>
          )}

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              onClick={() => {
                setShowUserModal(false)
                setEditingUser(null)
              }}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              disabled={formLoading}
            >
              取消
            </button>
            <button 
              onClick={handleSubmit}
              disabled={formLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
            >
              {formLoading && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              )}
              <span>{editingUser ? '更新' : '创建'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AccountManagement