/**
 * 密码重置页面
 * 用户通过邮件链接重置密码
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthService } from '../lib/auth'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * 重置密码表单数据接口
 */
interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

/**
 * 表单验证错误接口
 */
interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

/**
 * 密码重置页面组件
 * @returns 密码重置页面
 */
const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)

  useEffect(() => {
    // 检查URL中是否有重置令牌
    const token = searchParams.get('token')
    if (!token) {
      setIsValidToken(false)
    }
  }, [searchParams])

  /**
   * 处理表单输入变化
   * @param field 字段名
   * @param value 字段值
   */
  const handleInputChange = (field: keyof ResetPasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 清除通用错误信息
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }

  /**
   * 验证表单数据
   * @returns 验证结果
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 验证密码
    if (!form.password) {
      newErrors.password = '请输入新密码'
    } else if (form.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = '密码需要包含大小写字母和数字'
    }

    // 验证确认密码
    if (!form.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 处理密码重置提交
   * @param e 表单事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // 调用认证服务更新密码
      const response = await AuthService.updatePassword(form.password)

      if (response.error) {
        setErrors({ general: response.error })
      } else {
        setIsSuccess(true)
        // 3秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      setErrors({ general: '网络错误，请检查网络连接' })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 返回登录页面
   */
  const handleBackToLogin = () => {
    navigate('/login')
  }

  // 无效令牌页面
  if (!isValidToken) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='max-w-md w-full space-y-8 p-8'>
          {/* 头部 */}
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>SmartLis</h1>
            <p className='text-gray-600'>智能实验室管理系统</p>
          </div>

          {/* 错误信息 */}
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <div className='text-center space-y-6'>
              <div className='flex justify-center'>
                <AlertCircle className='h-16 w-16 text-red-500' />
              </div>

              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  链接无效或已过期
                </h2>
                <p className='text-gray-600'>
                  密码重置链接无效或已过期，请重新申请密码重置。
                </p>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  重新申请重置
                </button>

                <button
                  onClick={handleBackToLogin}
                  className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  返回登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 成功页面
  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='max-w-md w-full space-y-8 p-8'>
          {/* 头部 */}
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>SmartLis</h1>
            <p className='text-gray-600'>智能实验室管理系统</p>
          </div>

          {/* 成功信息 */}
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <div className='text-center space-y-6'>
              <div className='flex justify-center'>
                <CheckCircle className='h-16 w-16 text-green-500' />
              </div>

              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  密码重置成功
                </h2>
                <p className='text-gray-600'>
                  您的密码已成功重置，即将跳转到登录页面。
                </p>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={handleBackToLogin}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  立即登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-md w-full space-y-8 p-8'>
        {/* 头部 */}
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>SmartLIS</h1>
          <p className='text-gray-600'>智能实验室管理系统</p>
        </div>

        {/* 密码重置表单 */}
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              设置新密码
            </h2>
            <p className='text-gray-600 text-sm'>
              请输入您的新密码，密码需要包含大小写字母和数字。
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 新密码输入 */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                新密码
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder='请输入新密码'
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className='mt-1 flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.password}
                </div>
              )}
            </div>

            {/* 确认密码输入 */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                确认新密码
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder='请再次输入新密码'
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className='mt-1 flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* 通用错误信息 */}
            {errors.general && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                <div className='flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {errors.general}
                </div>
              </div>
            )}

            {/* 重置密码按钮 */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? <LoadingSpinner size='sm' text='' /> : '重置密码'}
            </button>
          </form>

          {/* 提示信息 */}
          <div className='mt-6 text-center text-sm text-gray-600'>
            <p>密码要求：至少6个字符，包含大小写字母和数字</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
