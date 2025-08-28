/**
 * HTTP客户端配置
 * 配置Axios实例，包含请求拦截器、响应拦截器等
 * @author Erikwang
 * @date 2025-08-20
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'

// API响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}

// 创建Axios实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 检查HTTP状态码
    if (response.status === 200) {
      // 检查业务状态
      if (data.success === true || data.code === 200) {
        return response
      } else if (data.success === false && data.message) {
        console.error('业务错误:', data.message)
        return Promise.reject(new Error(data.message))
      } else {
        // 兼容旧格式
        return response
      }
    } else {
      console.error('HTTP状态错误:', response.status)
      return Promise.reject(new Error(`HTTP错误: ${response.status}`))
    }
  },
  error => {
    console.error('响应拦截器错误:', error)

    // 网络错误处理
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('权限不足')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求错误: ${status}`)
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }

    return Promise.reject(error)
  }
)

export default http
