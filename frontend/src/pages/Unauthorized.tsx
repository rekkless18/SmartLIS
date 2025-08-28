/**
 * 无权限访问页面
 * 当用户访问没有权限的页面时显示此页面
 * @author Erikwang
 * @date 2025-08-20
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LocationState {
  from?: string
  reason?: string
  requiredPermissions?: string[]
  requiredRoles?: string[]
}

/**
 * 无权限访问页面组件
 * @returns 无权限页面组件
 */
const Unauthorized: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  const state = (location.state as LocationState) || {}
  const { from, reason, requiredPermissions, requiredRoles } = state

  // 获取错误信息
  const getErrorMessage = () => {
    switch (reason) {
      case 'permission_denied':
        return `您缺少访问此页面所需的权限：${requiredPermissions?.join(', ')}`
      case 'role_denied':
        return `您缺少访问此页面所需的角色：${requiredRoles?.join(', ')}`
      case 'page_access_denied':
        return '您没有权限访问此页面'
      case 'custom_permission_denied':
        return '您没有权限执行此操作'
      default:
        return '抱歉，您没有权限访问此页面'
    }
  }

  // 自动跳转倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  /**
   * 返回上一页
   */
  const handleGoBack = () => {
    if (from && from !== location.pathname) {
      navigate(from, { replace: true })
    } else {
      navigate(-1)
    }
  }

  /**
   * 返回首页
   */
  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        {/* 图标 */}
        <div className='flex justify-center mb-6'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center'>
            <AlertTriangle className='w-10 h-10 text-red-600' />
          </div>
        </div>

        {/* 标题 */}
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>访问被拒绝</h1>

        {/* 错误信息 */}
        <p className='text-gray-600 mb-6 leading-relaxed'>
          {getErrorMessage()}
        </p>

        {/* 来源页面信息 */}
        {from && (
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <p className='text-sm text-gray-500'>
              尝试访问的页面：
              <span className='font-mono text-gray-700 ml-1'>{from}</span>
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className='space-y-3'>
          <Button onClick={handleGoBack} variant='outline' className='w-full'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            返回上一页
          </Button>

          <Button onClick={handleGoHome} className='w-full'>
            <Home className='w-4 h-4 mr-2' />
            返回首页
          </Button>
        </div>

        {/* 自动跳转提示 */}
        <div className='mt-6 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-500'>
            {countdown > 0 ? (
              <>
                将在{' '}
                <span className='font-semibold text-blue-600'>{countdown}</span>{' '}
                秒后自动跳转到首页
              </>
            ) : (
              '正在跳转到首页...'
            )}
          </p>
        </div>

        {/* 联系管理员提示 */}
        <div className='mt-4'>
          <p className='text-xs text-gray-400'>
            如果您认为这是一个错误，请联系系统管理员
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
