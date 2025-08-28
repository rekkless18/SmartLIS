/**
 * 用户管理API服务
 * 封装用户、角色、权限相关的API调用
 * @author Erikwang
 * @date 2025-08-20
 */

import http, { ApiResponse } from '../lib/http'

// 用户接口定义
export interface User {
  id: string
  username: string
  email: string
  real_name: string
  phone?: string
  department?: string
  position?: string
  status: 'active' | 'inactive' | 'locked'
  last_login_at?: string
  created_at: string
  updated_at: string
  roles?: Role[]
}

// 角色接口定义
export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  is_system: boolean
  status: boolean
  created_at: string
  updated_at: string
  permissions?: Permission[]
  userCount?: number
}

// 权限接口定义
export interface Permission {
  id: string
  code: string
  name: string
  module: string
  page_name: string
  route_path: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  email: string
  real_name: string
  phone?: string
  department?: string
  position?: string
  roleIds?: string[]
}

// 更新用户参数
export interface UpdateUserParams {
  real_name?: string
  phone?: string
  department?: string
  position?: string
  status?: 'active' | 'inactive' | 'locked'
}

// 创建角色参数
export interface CreateRoleParams {
  name: string
  display_name: string
  description?: string
  permissionIds?: string[]
}

// 更新角色参数
export interface UpdateRoleParams {
  display_name?: string
  description?: string
  status?: boolean
}

/**
 * 用户管理API服务类
 */
export class UserService {
  /**
   * 获取用户列表
   * @param params 分页和搜索参数
   * @returns 用户列表
   */
  static async getUsers(params: PaginationParams & { status?: string } = {}): Promise<PaginatedResponse<User>> {
    const response = await http.get('/users', { params })
    
    // 直接使用response.data，因为后端返回的是 { success: true, data: [...], pagination: {...} }
    const apiData = response.data
    
    return {
      data: apiData.data || [],
      pagination: apiData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
  }

  /**
   * 获取用户详情
   * @param id 用户ID
   * @returns 用户详情
   */
  static async getUserById(id: string): Promise<User> {
    const response = await http.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  }

  /**
   * 创建用户
   * @param params 创建用户参数
   * @returns 创建的用户
   */
  static async createUser(params: CreateUserParams): Promise<User> {
    const response = await http.post<ApiResponse<User>>('/users', params)
    return response.data.data
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param params 更新参数
   * @returns 更新后的用户
   */
  static async updateUser(id: string, params: UpdateUserParams): Promise<User> {
    const response = await http.put<ApiResponse<User>>(`/users/${id}`, params)
    return response.data.data
  }

  /**
   * 删除用户
   * @param id 用户ID
   */
  static async deleteUser(id: string): Promise<void> {
    await http.delete(`/users/${id}`)
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   */
  static async resetPassword(id: string, newPassword: string): Promise<void> {
    await http.put(`/users/${id}/password`, { newPassword })
  }

  /**
   * 更新用户状态
   * @param id 用户ID
   * @param status 新状态
   */
  static async updateUserStatus(id: string, status: 'active' | 'inactive' | 'locked'): Promise<void> {
    await http.put(`/users/${id}/status`, { status })
  }

  /**
   * 分配用户角色
   * @param id 用户ID
   * @param roleIds 角色ID列表
   */
  static async assignUserRoles(id: string, roleIds: string[]): Promise<void> {
    await http.post(`/users/${id}/roles`, { roleIds })
  }

  /**
   * 分配单个角色给用户
   * @param userId 用户ID
   * @param roleId 角色ID
   */
  static async assignRole(userId: string, roleId: string): Promise<void> {
    await http.post(`/users/${userId}/roles`, { roleIds: [roleId] })
  }

  /**
   * 移除用户角色
   * @param userId 用户ID
   * @param roleId 角色ID
   */
  static async removeRole(userId: string, roleId: string): Promise<void> {
    await http.delete(`/users/${userId}/roles/${roleId}`)
  }
}

/**
 * 角色管理API服务类
 */
export class RoleService {
  /**
   * 获取角色列表
   * @param params 分页和搜索参数
   * @returns 角色列表
   */
  static async getRoles(params: PaginationParams = {}): Promise<PaginatedResponse<Role>> {
    const response = await http.get('/roles', { params })
    
    // 直接使用response.data，因为后端返回的是 { success: true, data: [...], pagination: {...} }
    const apiData = response.data
    
    return {
      data: apiData.data || [],
      pagination: apiData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
  }

  /**
   * 获取角色详情
   * @param id 角色ID
   * @returns 角色详情
   */
  static async getRoleById(id: string): Promise<Role> {
    const response = await http.get<ApiResponse<Role>>(`/roles/${id}`)
    return response.data.data
  }

  /**
   * 创建角色
   * @param params 创建角色参数
   * @returns 创建的角色
   */
  static async createRole(params: CreateRoleParams): Promise<Role> {
    const response = await http.post<ApiResponse<Role>>('/roles', params)
    return response.data.data
  }

  /**
   * 更新角色信息
   * @param id 角色ID
   * @param params 更新参数
   * @returns 更新后的角色
   */
  static async updateRole(id: string, params: UpdateRoleParams): Promise<Role> {
    const response = await http.put<ApiResponse<Role>>(`/roles/${id}`, params)
    return response.data.data
  }

  /**
   * 删除角色
   * @param id 角色ID
   */
  static async deleteRole(id: string): Promise<void> {
    await http.delete(`/roles/${id}`);
  }

  /**
   * 获取角色权限列表
   * @param id 角色ID
   * @returns 角色权限列表
   */
  static async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await http.get<ApiResponse<Permission[]>>(`/roles/${id}/permissions`)
    return response.data.data
  }

  /**
   * 分配角色权限
   * @param id 角色ID
   * @param permissionIds 权限ID列表
   */
  static async assignRolePermissions(id: string, permissionIds: string[]): Promise<void> {
    await http.post(`/roles/${id}/permissions`, { permissionIds })
  }
}

/**
 * 权限管理API服务类
 */
export class PermissionService {
  /**
   * 获取权限列表
   * @param params 分页和搜索参数
   * @returns 权限列表
   */
  static async getPermissions(params: PaginationParams & { module?: string } = {}): Promise<PaginatedResponse<Permission>> {
    const response = await http.get<ApiResponse<PaginatedResponse<Permission>>>('/permissions', { params })
    return response.data.data
  }

  /**
   * 获取权限模块列表
   * @returns 模块列表
   */
  static async getPermissionModules(): Promise<{ name: string; label: string }[]> {
    const response = await http.get<ApiResponse<{ name: string; label: string }[]>>('/permissions/modules')
    return response.data.data
  }

  /**
   * 按模块分组获取权限
   * @returns 分组权限列表
   */
  static async getGroupedPermissions(): Promise<{ module: string; permissions: Permission[] }[]> {
    const response = await http.get<ApiResponse<{ module: string; permissions: Permission[] }[]>>('/permissions/grouped')
    return response.data.data
  }

  /**
   * 获取权限详情
   * @param id 权限ID
   * @returns 权限详情
   */
  static async getPermissionById(id: string): Promise<Permission> {
    const response = await http.get<ApiResponse<Permission>>(`/permissions/${id}`)
    return response.data.data
  }

  /**
   * 创建权限
   * @param params 创建权限参数
   * @returns 创建的权限
   */
  static async createPermission(params: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> {
    const response = await http.post<ApiResponse<Permission>>('/permissions', params)
    return response.data.data
  }

  /**
   * 更新权限信息
   * @param id 权限ID
   * @param params 更新参数
   * @returns 更新后的权限
   */
  static async updatePermission(id: string, params: Partial<Omit<Permission, 'id' | 'code' | 'created_at' | 'updated_at'>>): Promise<Permission> {
    const response = await http.put<ApiResponse<Permission>>(`/permissions/${id}`, params)
    return response.data.data
  }

  /**
   * 删除权限
   * @param id 权限ID
   */
  static async deletePermission(id: string): Promise<void> {
    await http.delete(`/permissions/${id}`)
  }
}

// 导出默认服务
export default {
  UserService,
  RoleService,
  PermissionService,
}