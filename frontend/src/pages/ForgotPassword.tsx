/**
 * 忘记密码页面
 * 用户可以通过邮箱重置密码
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthService } from '../lib/auth'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * 忘记密码表单数据接口
 */
interface ForgotPasswordForm {
  email: string
}

/**
 * 表单验证错误接口
 */
interface FormErrors {
  email?: string
  general?: string
}

/**
 * 忘记密码页面组件
 * @returns 忘记密码页面
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState<ForgotPasswordForm>({
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * 处理表单输入变化
   * @param field 字段名
   * @param value 字段值
   */
  const handleInputChange = (
    field: keyof ForgotPasswordForm,
    value: string
  ) => {
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

    // 验证邮箱
    if (!form.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 处理重置密码提交
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
      // 调用认证服务重置密码
      const response = await AuthService.resetPassword(form.email)

      if (response.error) {
        setErrors({ general: response.error })
      } else {
        setIsSuccess(true)
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
                  重置邮件已发送
                </h2>
                <p className='text-gray-600'>
                  我们已向{' '}
                  <span className='font-medium text-gray-900'>
                    {form.email}
                  </span>{' '}
                  发送了密码重置邮件。
                </p>
                <p className='text-gray-600 mt-2'>
                  请检查您的邮箱并点击邮件中的链接来重置密码。
                </p>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={handleBackToLogin}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  返回登录
                </button>

                <p className='text-sm text-gray-500'>
                  没有收到邮件？请检查垃圾邮件文件夹，或
                  <button
                    onClick={() => setIsSuccess(false)}
                    className='text-blue-600 hover:text-blue-500 ml-1'
                  >
                    重新发送
                  </button>
                </p>
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

        {/* 忘记密码表单 */}
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='mb-6'>
            <button
              onClick={handleBackToLogin}
              className='flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              返回登录
            </button>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              忘记密码
            </h2>
            <p className='text-gray-600 text-sm'>
              请输入您的邮箱地址，我们将向您发送密码重置链接。
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 邮箱输入 */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                邮箱地址
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  value={form.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder='请输入您的邮箱地址'
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <div className='mt-1 flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.email}
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

            {/* 发送重置邮件按钮 */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? (
                <LoadingSpinner size='sm' text='' />
              ) : (
                '发送重置邮件'
              )}
            </button>
          </form>

          {/* 提示信息 */}
          <div className='mt-6 text-center text-sm text-gray-600'>
            <p>记起密码了？</p>
            <Link
              to='/login'
              className='text-blue-600 hover:text-blue-500 transition-colors'
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
