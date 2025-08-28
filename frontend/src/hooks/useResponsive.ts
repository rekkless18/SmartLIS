/**
 * 响应式Hook
 * 用于检测屏幕尺寸和响应式断点
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'

// 响应式断点配置
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// 响应式状态接口
export interface ResponsiveState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

/**
 * 获取当前断点
 * @param width 屏幕宽度
 * @returns 断点名称
 */
const getBreakpoint = (width: number): ResponsiveState['breakpoint'] => {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

/**
 * 响应式Hook
 * @returns 响应式状态
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // 服务端渲染时的默认值
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        breakpoint: 'lg',
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width)

    return {
      width,
      height,
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isLargeDesktop: width >= breakpoints.xl,
      breakpoint,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const breakpoint = getBreakpoint(width)

      setState({
        width,
        height,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isLargeDesktop: width >= breakpoints.xl,
        breakpoint,
      })
    }

    window.addEventListener('resize', handleResize)
    
    // 初始化时调用一次
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return state
}

/**
 * 检查是否匹配指定断点
 * @param breakpoint 断点名称
 * @returns 是否匹配
 */
export const useBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  const { width } = useResponsive()
  return width >= breakpoints[breakpoint]
}

/**
 * 媒体查询Hook
 * @param query 媒体查询字符串
 * @returns 是否匹配
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

export default useResponsive