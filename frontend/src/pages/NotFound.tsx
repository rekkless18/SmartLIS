/**
 * 404页面
 * 页面未找到时显示的组件
 * @author Erikwang
 * @date 2025-08-20
 */

import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

/**
 * 404页面组件
 * @returns 404页面
 */
const NotFound: React.FC = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full text-center'>
        {/* 404图标 */}
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-gray-300'>404</h1>
        </div>

        {/* 错误信息 */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>页面未找到</h2>
          <p className='text-gray-600'>抱歉，您访问的页面不存在或已被移除。</p>
        </div>

        {/* 操作按钮 */}
        <div className='space-y-4'>
          <Link
            to='/dashboard'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Home className='w-4 h-4 mr-2' />
            返回首页
          </Link>

          <div className='text-center'>
            <button
              onClick={() => window.history.back()}
              className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='w-4 h-4 mr-1' />
              返回上一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
