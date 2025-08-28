/**
 * 主应用组件
 * SmartLis智能实验室管理系统前端应用入口
 * @author Erikwang
 * @date 2025-08-20
 */

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthInitService } from './lib/authInit'
import './index.css'

/**
 * 主应用组件
 * @returns 应用组件
 */
function App() {
  useEffect(() => {
    // 简单设置认证状态监听器，不阻塞应用启动
    try {
      AuthInitService.setupAuthListener()
      // 异步初始化认证状态，不等待结果
      AuthInitService.initialize().catch(error => {
        console.warn('认证初始化失败，但应用继续运行:', error)
      })
    } catch (error) {
      console.warn('认证服务设置失败，但应用继续运行:', error)
    }
  }, [])

  return (
    <div className='min-h-screen bg-gray-50'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
