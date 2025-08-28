/**
 * 邮箱验证页面
 * 处理用户邮箱验证和重新发送验证邮件
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { AuthInitService } from '../lib/authInit'
import { useAuthStore } from '../stores/auth'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * 邮箱验证页面组件
 * @returns 邮箱验证页面
 */
const EmailVerification: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const handleVerification = async () => {
      // 检查URL中是否有验证参数
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      if (token && type === 'email') {
        setIsVerifying(true)
        try {
          await AuthInitService.handleEmailVerification()
          setVerificationStatus('success')
          setSuccessMessage('邮箱验证成功！即将跳转到首页...')

          // 3秒后跳转到首页
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        } catch (error) {
          setVerificationStatus('error')
          setErrorMessage('邮箱验证失败，请重试')
        } finally {
          setIsVerifying(false)
        }
      } else {
        // 检查用户是否需要验证邮箱
        const needsVerification = await AuthInitService.checkEmailVerification()
        if (!needsVerification && user) {
          // 用户已验证，跳转到首页
          navigate('/dashboard')
        }
      }
    }

    handleVerification()
  }, [searchParams, navigate, user])

  /**
   * 重新发送验证邮件
   */
  const handleResendEmail = async () => {
    if (!user?.email) {
      setErrorMessage('无法获取用户邮箱信息')
      return
    }

    setIsResending(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await AuthInitService.resendVerificationEmail(user.email)

      if (response.error) {
        setErrorMessage(response.error)
      } else {
        setSuccessMessage('验证邮件已重新发送，请检查您的邮箱')
      }
    } catch (error) {
      setErrorMessage('发送验证邮件失败，请重试')
    } finally {
      setIsResending(false)
    }
  }

  /**
   * 返回登录页面
   */
  const handleBackToLogin = () => {
    navigate('/login')
  }

  // 验证中状态
  if (isVerifying) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='max-w-md w-full space-y-8 p-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>SmartLis</h1>
            <p className='text-gray-600'>智能实验室管理系统</p>
          </div>

          <div className='bg-white rounded-lg shadow-lg p-8'>
            <div className='text-center space-y-6'>
              <LoadingSpinner size='lg' />
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  正在验证邮箱
                </h2>
                <p className='text-gray-600'>
                  请稍候，我们正在验证您的邮箱地址...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 验证成功状态
  if (verificationStatus === 'success') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='max-w-md w-full space-y-8 p-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>SmartLis</h1>
            <p className='text-gray-600'>智能实验室管理系统</p>
          </div>

          <div className='bg-white rounded-lg shadow-lg p-8'>
            <div className='text-center space-y-6'>
              <div className='flex justify-center'>
                <CheckCircle className='h-16 w-16 text-green-500' />
              </div>

              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  邮箱验证成功
                </h2>
                <p className='text-gray-600'>{successMessage}</p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
              >
                立即进入系统
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 验证失败或等待验证状态
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-md w-full space-y-8 p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>SmartLIS</h1>
          <p className='text-gray-600'>智能实验室管理系统</p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='text-center space-y-6'>
            <div className='flex justify-center'>
              {verificationStatus === 'error' ? (
                <AlertCircle className='h-16 w-16 text-red-500' />
              ) : (
                <Mail className='h-16 w-16 text-blue-500' />
              )}
            </div>

            <div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                {verificationStatus === 'error'
                  ? '邮箱验证失败'
                  : '请验证您的邮箱'}
              </h2>
              <p className='text-gray-600'>
                {verificationStatus === 'error'
                  ? errorMessage || '邮箱验证失败，请重试'
                  : `我们已向 ${user?.email} 发送了验证邮件，请检查您的邮箱并点击验证链接。`}
              </p>
            </div>

            {/* 成功信息 */}
            {successMessage && (
              <div className='bg-green-50 border border-green-200 rounded-md p-3'>
                <div className='flex items-center text-green-600 text-sm'>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  {successMessage}
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {errorMessage && verificationStatus !== 'error' && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                <div className='flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {errorMessage}
                </div>
              </div>
            )}

            <div className='space-y-3'>
              {/* 重新发送验证邮件按钮 */}
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isResending ? (
                  <LoadingSpinner size='sm' text='' />
                ) : (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    重新发送验证邮件
                  </>
                )}
              </button>

              {/* 返回登录按钮 */}
              <button
                onClick={handleBackToLogin}
                className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
              >
                返回登录
              </button>
            </div>

            <div className='text-xs text-gray-500'>
              <p>没有收到邮件？请检查垃圾邮件文件夹</p>
              <p className='mt-1'>如果仍有问题，请联系系统管理员</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
