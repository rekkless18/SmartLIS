/**
 * 认证初始化服务
 * 在应用启动时检查用户认证状态并恢复会话
 * @author Erikwang
 * @date 2025-08-20
 */

import { supabase } from './supabase'
import { AuthService } from './auth'
import { useAuthStore } from '../stores/auth'

/**
 * 认证初始化类
 */
export class AuthInitService {
  // 初始化重试计数器
  private static initRetryCount = 0
  private static readonly MAX_INIT_RETRIES = 3

  // 监听器注册状态
  private static isListenerSetup = false

  // getCurrentUser调用计数器，防止无限循环
  private static getCurrentUserCallCount = 0
  private static readonly MAX_GET_USER_CALLS = 5

  /**
   * 安全的获取当前用户方法，带有循环检测
   * @returns 用户信息或null
   */
  private static async safeGetCurrentUser(): Promise<any> {
    this.getCurrentUserCallCount++
    console.log(
      `🔢 getCurrentUser调用计数: ${this.getCurrentUserCallCount}/${this.MAX_GET_USER_CALLS}`
    )

    if (this.getCurrentUserCallCount > this.MAX_GET_USER_CALLS) {
      console.error('🚨 getCurrentUser调用次数超限，可能存在循环调用')
      this.getCurrentUserCallCount = 0 // 重置计数器
      return null
    }

    try {
      const result = await AuthService.getCurrentUser()
      // 成功获取后重置计数器
      if (result) {
        this.getCurrentUserCallCount = 0
      }
      return result
    } catch (error) {
      console.error('🔥 safeGetCurrentUser调用失败:', error)
      this.getCurrentUserCallCount = 0 // 重置计数器
      return null
    }
  }

  /**
   * 初始化认证状态
   * 检查本地存储的会话并验证有效性
   */
  static async initialize(): Promise<void> {
    try {
      console.log('🚀 开始初始化认证状态...')
      const { login, logout, setLoading } = useAuthStore.getState()

      setLoading(true)

      // 获取当前会话
      console.log('📡 获取当前会话...')
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ 获取会话失败:', error)

        // 如果是API key错误且未达到重试上限，尝试重试
        if (
          error.message?.includes('API key') &&
          this.initRetryCount < this.MAX_INIT_RETRIES
        ) {
          this.initRetryCount++
          console.log(
            `🔄 认证初始化重试 ${this.initRetryCount}/${this.MAX_INIT_RETRIES}`
          )
          setTimeout(() => this.initialize(), 1000 * this.initRetryCount) // 递增延迟重试
          return
        }

        console.log('🚪 会话获取失败，执行登出')
        logout()
        return
      }

      // 重置重试计数器
      this.initRetryCount = 0

      if (session && session.user) {
        console.log('✅ 找到有效会话:', {
          userId: session.user.id,
          email: session.user.email,
        })

        // 会话有效，获取用户详细信息
        console.log('📝 获取用户详细信息...')
        const userProfile = await this.safeGetCurrentUser()

        if (userProfile) {
          console.log('👤 用户信息获取成功，恢复登录状态')
          // 恢复用户登录状态
          login(session.access_token, userProfile)
        } else {
          // 无法获取用户信息，清除会话
          console.warn('⚠️ 会话有效但无法获取用户信息，清除会话')
          logout()
        }
      } else {
        console.log('❌ 没有有效会话，执行登出')
        // 没有有效会话
        logout()
      }

      console.log('✨ 认证初始化完成')
    } catch (err) {
      console.error('❌ 认证初始化失败:', err)

      // 避免无限重试
      if (this.initRetryCount < this.MAX_INIT_RETRIES) {
        this.initRetryCount++
        console.log(
          `🔄 认证初始化异常重试 ${this.initRetryCount}/${this.MAX_INIT_RETRIES}`
        )
        setTimeout(() => this.initialize(), 2000 * this.initRetryCount)
        return
      }

      useAuthStore.getState().logout()
    } finally {
      console.log('🏁 认证初始化finally块开始执行')
      const authStore = useAuthStore.getState()
      console.log('📊 当前认证状态:', {
        isAuthenticated: authStore.isAuthenticated,
        hasUser: !!authStore.user,
        loading: authStore.loading,
        timestamp: new Date().toISOString(),
      })

      console.log('🔄 设置loading状态为false...')
      authStore.setLoading(false)

      // 验证状态是否正确设置
      setTimeout(() => {
        const newState = useAuthStore.getState()
        console.log('✅ 状态设置后验证:', {
          loading: newState.loading,
          isAuthenticated: newState.isAuthenticated,
          timestamp: new Date().toISOString(),
        })
      }, 100)

      console.log('🏁 认证初始化finally块执行完成')
    }
  }

  // 防抖定时器
  private static authStateDebounceTimer: NodeJS.Timeout | null = null
  private static isProcessingAuthState = false

  /**
   * 设置认证状态监听器
   * 监听Supabase认证状态变化
   */
  static setupAuthListener(): void {
    // 防止重复注册监听器
    if (this.isListenerSetup) {
      console.log('认证监听器已经设置，跳过重复注册')
      return
    }

    console.log('设置认证状态监听器...')
    this.isListenerSetup = true

    const { login, logout } = useAuthStore.getState()

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 认证状态变化:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        timestamp: new Date().toISOString(),
      })

      // 防抖处理，避免频繁触发
      if (this.authStateDebounceTimer) {
        console.log('⏱️ 清除之前的防抖定时器')
        clearTimeout(this.authStateDebounceTimer)
      }

      // 如果正在处理认证状态，跳过
      if (this.isProcessingAuthState) {
        console.log('⚠️ 正在处理认证状态，跳过此次变化')
        return
      }

      this.authStateDebounceTimer = setTimeout(async () => {
        console.log('🚀 开始处理认证状态变化:', event)
        this.isProcessingAuthState = true

        try {
          switch (event) {
            case 'SIGNED_IN':
              console.log('✅ 处理登录事件')
              if (session && session.user) {
                console.log('📝 获取用户详细信息...')
                const userProfile = await this.safeGetCurrentUser()
                if (userProfile) {
                  console.log('👤 用户信息获取成功，更新状态')
                  login(session.access_token, userProfile)
                } else {
                  console.warn('⚠️ 无法获取用户详细信息')
                }
              }
              break

            case 'SIGNED_OUT':
              console.log('🚪 处理登出事件')
              logout()
              break

            case 'TOKEN_REFRESHED':
              console.log('🔄 处理令牌刷新事件')
              if (session && session.user) {
                const userProfile = await this.safeGetCurrentUser()
                if (userProfile) {
                  login(session.access_token, userProfile)
                }
              }
              break

            case 'USER_UPDATED':
              console.log('📝 处理用户更新事件')
              if (session && session.user) {
                const userProfile = await this.safeGetCurrentUser()
                if (userProfile) {
                  login(session.access_token, userProfile)
                }
              }
              break

            default:
              console.log('❓ 未处理的认证事件:', event)
              break
          }
        } catch (error) {
          console.error('❌ 处理认证状态变化失败:', error)
          // 如果是API key错误，停止进一步处理
          if (error.message?.includes('No API key found')) {
            console.error('🔑 API key错误，停止认证处理')
            return
          }
        } finally {
          console.log('✨ 认证状态处理完成')
          this.isProcessingAuthState = false
        }
      }, 300) // 300ms 防抖延迟
    })
  }

  /**
   * 检查用户是否需要验证邮箱
   * @returns 是否需要验证邮箱
   */
  static async checkEmailVerification(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user ? !user.email_confirmed_at : false
    } catch (err) {
      return false
    }
  }

  /**
   * 重新发送验证邮件
   * @param email 邮箱地址
   * @returns 操作结果
   */
  static async resendVerificationEmail(
    email: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      return {
        error: error ? error.message : null,
      }
    } catch (err) {
      return {
        error: '发送验证邮件失败，请重试',
      }
    }
  }

  /**
   * 处理邮箱验证回调
   * 处理用户点击邮件验证链接后的逻辑
   */
  static async handleEmailVerification(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('邮箱验证失败:', error)
        return
      }

      if (data.session && data.session.user) {
        // 验证成功，更新用户状态
        const userProfile = await this.safeGetCurrentUser()
        if (userProfile) {
          const { login } = useAuthStore.getState()
          login(data.session.access_token, userProfile)
        }
      }
    } catch (err) {
      console.error('处理邮箱验证失败:', err)
    }
  }

  /**
   * 清理认证相关的本地存储
   */
  static clearAuthStorage(): void {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('auth-storage')
      sessionStorage.clear()
    } catch (err) {
      console.error('清理认证存储失败:', err)
    }
  }

  /**
   * 检查认证令牌是否即将过期
   * @param threshold 提前刷新的时间阈值（秒），默认5分钟
   * @returns 是否需要刷新令牌
   */
  static async shouldRefreshToken(threshold: number = 300): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return false
      }

      const expiresAt = session.expires_at
      const currentTime = Math.floor(Date.now() / 1000)

      return expiresAt ? expiresAt - currentTime < threshold : false
    } catch (err) {
      return false
    }
  }

  /**
   * 手动刷新认证令牌
   * @returns 刷新结果
   */
  static async refreshToken(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (data.session && data.session.user) {
        const userProfile = await this.safeGetCurrentUser()
        if (userProfile) {
          const { login } = useAuthStore.getState()
          login(data.session.access_token, userProfile)
        }
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: '刷新令牌失败',
      }
    }
  }
}
