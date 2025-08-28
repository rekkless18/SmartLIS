/**
 * 用户认证状态管理
 * 使用Zustand管理用户登录状态、用户信息等
 * @author Erikwang
 * @date 2025-08-20
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 用户信息接口
export interface User {
  id: string
  username: string
  email: string
  realName: string
  avatar?: string
  phone?: string
  department?: string
  position?: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

// 认证状态接口
interface AuthState {
  // 状态
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean

  // 操作方法
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

// 创建认证状态store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,

      // 登录方法
      login: (token: string, user: User) => {
        localStorage.setItem('token', token)
        set({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        })
      },

      // 登出方法
      logout: () => {
        localStorage.removeItem('token')
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        })
      },

      // 更新用户信息
      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      // 检查认证状态
      checkAuth: () => {
        const { token, user } = get()
        const storedToken = localStorage.getItem('token')
        
        // 必须同时有token和用户信息
        if (!(token || storedToken) || !user) {
          return false
        }
        
        // 如果store中没有token但localStorage有，则更新store
        if (!token && storedToken) {
          set({ token: storedToken, isAuthenticated: true })
        }
        
        return true
      },

      // 检查权限
      hasPermission: (permission: string) => {
        const { user, isAuthenticated } = get()
        console.log(`=== hasPermission Debug ===`)
        console.log(`Checking permission: ${permission}`)
        console.log(`Is authenticated:`, isAuthenticated)
        console.log(`User:`, user)
        console.log(`User permissions:`, user?.permissions)
        
        if (!isAuthenticated || !user) {
          console.log(`Permission denied: Not authenticated or no user`)
          return false
        }
        
        const hasPermission = user.permissions?.includes(permission) || false
        console.log(`Permission result for "${permission}":`, hasPermission)
        
        return hasPermission
      },

      // 检查角色
      hasRole: (role: string) => {
        const { user } = get()
        return user?.roles?.includes(role) || false
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
)
