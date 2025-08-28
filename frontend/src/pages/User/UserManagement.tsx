/**
 * 用户管理页面
 * 管理系统用户、角色和权限配置
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Shield, UserPlus, Settings } from 'lucide-react'
import { UserService, RoleService, PermissionService } from '../../services'
import type { User, Role, Permission } from '../../services/userService'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { toast } from 'sonner'
import { useDataCache } from '../../hooks/useDataCache'
import { useSearchDebounce } from '../../hooks/useDebounce'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorBoundary from '../../components/ErrorBoundary'

// 接口定义已移至services中

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  /**
   * 加载用户列表
   */
  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await UserService.getUsers({
        page: pagination.page,
        limit: pagination.limit
      })
      setUsers(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }))
    } catch (error) {
      console.error('加载用户列表失败:', error)
      toast.error('加载用户列表失败')
    } finally {
      setUsersLoading(false)
    }
  }

  /**
   * 加载角色列表
   */
  const loadRoles = async () => {
    try {
      setRolesLoading(true)
      const response = await RoleService.getRoles({ limit: 100 })
      setRoles(response.data)
    } catch (error) {
      console.error('加载角色列表失败:', error)
      toast.error('加载角色列表失败')
    } finally {
      setRolesLoading(false)
    }
  }

  /**
   * 加载权限列表
   */
  const loadPermissions = async () => {
    try {
      setPermissionsLoading(true)
      const response = await PermissionService.getPermissions({ limit: 200 })
      setPermissions(response.data)
    } catch (error) {
      console.error('加载权限列表失败:', error)
      toast.error('加载权限列表失败')
    } finally {
      setPermissionsLoading(false)
    }
  }

  /**
   * 创建用户
   */
  const handleCreateUser = async (userData: any) => {
    try {
      await UserService.createUser(userData)
      toast.success('用户创建成功')
      setShowUserModal(false)
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('创建用户失败:', error)
      toast.error(error.message || '创建用户失败')
    }
  }

  /**
   * 更新用户
   */
  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      await UserService.updateUser(id, userData)
      toast.success('用户更新成功')
      setShowUserModal(false)
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('更新用户失败:', error)
      toast.error(error.message || '更新用户失败')
    }
  }

  /**
   * 删除用户
   */
  const handleDeleteUser = async (id: string) => {
    if (!confirm('确定要删除该用户吗？')) return
    
    try {
      await UserService.deleteUser(id)
      toast.success('用户删除成功')
      loadUsers()
    } catch (error: any) {
      console.error('删除用户失败:', error)
      toast.error(error.message || '删除用户失败')
    }
  }

  /**
   * 重置密码
   */
  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('请输入新密码（至少6位）:')
    if (!newPassword || newPassword.length < 6) {
      toast.error('密码长度不能少于6位')
      return
    }
    
    try {
      await UserService.resetPassword(id, newPassword)
      toast.success('密码重置成功')
    } catch (error: any) {
      console.error('重置密码失败:', error)
      toast.error(error.message || '重置密码失败')
    }
  }

  /**
   * 创建角色
   */
  const handleCreateRole = async (roleData: any) => {
    try {
      await RoleService.createRole(roleData)
      toast.success('角色创建成功')
      setShowRoleModal(false)
      setEditingRole(null)
      loadRoles()
    } catch (error: any) {
      console.error('创建角色失败:', error)
      toast.error(error.message || '创建角色失败')
    }
  }

  /**
   * 更新角色
   */
  const handleUpdateRole = async (id: string, roleData: any) => {
    try {
      await RoleService.updateRole(id, roleData)
      toast.success('角色更新成功')
      setShowRoleModal(false)
      setEditingRole(null)
      loadRoles()
    } catch (error: any) {
      console.error('更新角色失败:', error)
      toast.error(error.message || '更新角色失败')
    }
  }

  /**
   * 删除角色
   */
  const handleDeleteRole = async (id: string) => {
    if (!confirm('确定要删除该角色吗？')) return
    
    try {
      await RoleService.deleteRole(id)
      toast.success('角色删除成功')
      loadRoles()
    } catch (error: any) {
      console.error('删除角色失败:', error)
      toast.error(error.message || '删除角色失败')
    }
  }
  // 初始化数据加载
  useEffect(() => {
    loadUsers()
    loadRoles()
    loadPermissions()
  }, [])

  // 分页变化时重新加载用户
  useEffect(() => {
    loadUsers()
  }, [pagination.page, pagination.limit])

  /**
   * 切换用户状态
   */
  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await UserService.updateUserStatus(id, newStatus)
      toast.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
      loadUsers()
    } catch (error: any) {
      console.error('更新用户状态失败:', error)
      toast.error(error.message || '更新用户状态失败')
    }
  }





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
   * 处理编辑用户
   * @param user 用户
   */
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  /**
   * 处理编辑角色
   * @param role 角色
   */
  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowRoleModal(true)
  }

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
      dataIndex: 'role',
      key: 'role',
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
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
        >
          {value === 'active'
            ? '活跃'
            : value === 'inactive'
              ? '非活跃'
              : '锁定'}
        </span>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
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
          <button 
            onClick={() => handleToggleUserStatus(record.id, record.status)}
            className={`text-sm ${
              record.status === 'active' 
                ? 'text-orange-600 hover:text-orange-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </button>
        </div>
      ),
    },
  ]

  // 角色表格列配置
  const roleColumns = [
    {
      title: '角色名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (_value: unknown, record: Role) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleEditRole(record)}
            className='text-blue-600 hover:text-blue-800 text-sm'
          >
            编辑
          </button>
          <button 
            onClick={() => {
              // TODO: 实现权限分配功能
              toast.info('权限分配功能开发中')
            }}
            className='text-green-600 hover:text-green-800 text-sm'
          >
            权限
          </button>
          <button 
            onClick={() => handleDeleteRole(record.id)}
            className='text-red-600 hover:text-red-800 text-sm'
          >
            删除
          </button>
        </div>
      ),
    },
  ]

  // 权限表格列配置
  const permissionColumns = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      render: (value: string) => (
        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>{value}</code>
      ),
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: '页面名称',
      dataIndex: 'page_name',
      key: 'page_name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  // 页面加载状态已经移到各个表格组件中

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>用户管理</h1>
        <p className='text-gray-600 mt-1'>管理系统用户、角色和权限配置</p>
      </div>

      {/* 标签页导航 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            用户管理
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            角色管理
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            权限配置
          </button>
        </nav>
      </div>

      {/* 用户管理标签页 */}
      {activeTab === 'users' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>用户列表</h2>
            <button
              onClick={() => {
                setEditingUser(null)
                setShowUserModal(true)
              }}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
            >
              <UserPlus className='w-4 h-4' />
              <span>添加用户</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={userColumns}
              dataSource={users}
              loading={usersLoading}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
              }}
            />
          </div>
        </div>
      )}

      {/* 角色管理标签页 */}
      {activeTab === 'roles' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>角色列表</h2>
            <button
              onClick={() => {
                setEditingRole(null)
                setShowRoleModal(true)
              }}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
            >
              <Shield className='w-4 h-4' />
              <span>添加角色</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={roleColumns}
              dataSource={roles}
              loading={rolesLoading}
              pagination={{
                current: 1,
                pageSize: 10,
                total: roles.length,
              }}
            />
          </div>
        </div>
      )}

      {/* 权限配置标签页 */}
      {activeTab === 'permissions' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold text-gray-900'>权限列表</h2>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
              <Settings className='w-4 h-4' />
              <span>权限配置</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow'>
            <DataTable
              columns={permissionColumns}
              dataSource={permissions}
              loading={permissionsLoading}
              pagination={{
                current: 1,
                pageSize: 10,
                total: permissions.length,
              }}
            />
          </div>
        </div>
      )}

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
                用户名
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                defaultValue={editingUser?.username || ''}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                真实姓名
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                defaultValue={editingUser?.real_name || ''}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                邮箱
              </label>
              <input
                type='email'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                defaultValue={editingUser?.email || ''}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                电话
              </label>
              <input
                type='tel'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                defaultValue={editingUser?.phone || ''}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                角色
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                <option value=''>请选择角色</option>
                {roles.map(role => (
                  <option key={role.id} value={role.display_name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                部门
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                defaultValue={editingUser?.department || ''}
              />
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              onClick={() => {
                setShowUserModal(false)
                setEditingUser(null)
              }}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              取消
            </button>
            <button 
              onClick={() => {
                // TODO: 实现表单数据收集和提交
                const formData = {
                  username: 'test',
                  real_name: 'test',
                  email: 'test@example.com',
                  phone: '13800138000',
                  department: 'test'
                }
                if (editingUser) {
                  handleUpdateUser(editingUser.id, formData)
                } else {
                  handleCreateUser(formData)
                }
              }}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              {editingUser ? '更新' : '创建'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 角色编辑模态框 */}
      <Modal
        open={showRoleModal}
        onClose={() => {
          setShowRoleModal(false)
          setEditingRole(null)
        }}
        title={editingRole ? '编辑角色' : '新增角色'}
        size='large'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              角色名称
            </label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              defaultValue={editingRole?.display_name || ''}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              描述
            </label>
            <textarea
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              defaultValue={editingRole?.description || ''}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              权限配置
            </label>
            <div className='border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto'>
              <div className='space-y-2'>
                {permissions.map(permission => (
                  <label
                    key={permission.id}
                    className='flex items-center space-x-2'
                  >
                    <input
                      type='checkbox'
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      defaultChecked={editingRole?.permissions?.some(
                        p => p.id === permission.id
                      ) || false}
                    />
                    <span className='text-sm text-gray-700'>
                      {permission.name} ({permission.code})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              onClick={() => {
                setShowRoleModal(false)
                setEditingRole(null)
              }}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              取消
            </button>
            <button 
              onClick={() => {
                // TODO: 实现表单数据收集和提交
                const formData = {
                  display_name: 'test角色',
                  description: '测试角色描述'
                }
                if (editingRole) {
                  handleUpdateRole(editingRole.id, formData)
                } else {
                  handleCreateRole(formData)
                }
              }}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              {editingRole ? '更新' : '创建'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement
