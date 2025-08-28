/**
 * 通用抽屉组件
 * 支持多种方向、尺寸、动画效果等
 * @author Erikwang
 * @date 2025-08-20
 */

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * 抽屉方向类型
 */
export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

/**
 * 抽屉尺寸类型
 */
export type DrawerSize = 'small' | 'medium' | 'large' | 'xlarge'

/**
 * 抽屉组件属性
 */
export interface DrawerProps {
  /** 是否显示抽屉 */
  open: boolean
  /** 关闭抽屉回调 */
  onClose: () => void
  /** 抽屉标题 */
  title?: string
  /** 抽屉内容 */
  children: React.ReactNode
  /** 抽屉方向 */
  placement?: DrawerPlacement
  /** 抽屉尺寸 */
  size?: DrawerSize
  /** 自定义宽度/高度 */
  width?: string | number
  /** 自定义高度/宽度 */
  height?: string | number
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 点击遮罩层是否关闭 */
  maskClosable?: boolean
  /** 按ESC键是否关闭 */
  keyboard?: boolean
  /** 是否显示遮罩层 */
  mask?: boolean
  /** 遮罩层样式 */
  maskStyle?: React.CSSProperties
  /** 抽屉样式 */
  style?: React.CSSProperties
  /** 抽屉类名 */
  className?: string
  /** 内容区域类名 */
  bodyClassName?: string
  /** 头部区域类名 */
  headerClassName?: string
  /** 底部区域类名 */
  footerClassName?: string
  /** 底部内容 */
  footer?: React.ReactNode
  /** 是否显示默认底部 */
  showFooter?: boolean
  /** 确认按钮文本 */
  okText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮回调 */
  onOk?: () => void
  /** 取消按钮回调 */
  onCancel?: () => void
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 抽屉层级 */
  zIndex?: number
  /** 销毁时是否保留DOM */
  destroyOnClose?: boolean
  /** 动画持续时间(ms) */
  transitionDuration?: number
  /** 是否推拽页面内容 */
  push?: boolean
}

/**
 * 获取抽屉尺寸
 * @param size 尺寸类型
 * @param placement 方向
 * @returns 尺寸值
 */
const getDrawerSize = (
  size: DrawerSize,
  placement: DrawerPlacement
): string => {
  const isHorizontal = placement === 'left' || placement === 'right'

  if (isHorizontal) {
    const widthMap = {
      small: '320px',
      medium: '480px',
      large: '640px',
      xlarge: '800px',
    }
    return widthMap[size]
  } else {
    const heightMap = {
      small: '240px',
      medium: '360px',
      large: '480px',
      xlarge: '600px',
    }
    return heightMap[size]
  }
}

/**
 * 获取抽屉位置样式
 * @param placement 方向
 * @returns 样式对象
 */
const getDrawerPositionStyle = (placement: DrawerPlacement) => {
  const positionMap = {
    top: {
      top: 0,
      left: 0,
      right: 0,
      transform: 'translateY(-100%)',
    },
    right: {
      top: 0,
      right: 0,
      bottom: 0,
      transform: 'translateX(100%)',
    },
    bottom: {
      bottom: 0,
      left: 0,
      right: 0,
      transform: 'translateY(100%)',
    },
    left: {
      top: 0,
      left: 0,
      bottom: 0,
      transform: 'translateX(-100%)',
    },
  }
  return positionMap[placement]
}

/**
 * 获取抽屉打开时的变换样式
 * @param placement 方向
 * @returns 变换样式
 */
const getDrawerOpenTransform = (placement: DrawerPlacement): string => {
  const transformMap = {
    top: 'translateY(0)',
    right: 'translateX(0)',
    bottom: 'translateY(0)',
    left: 'translateX(0)',
  }
  return transformMap[placement]
}

/**
 * 通用抽屉组件
 * @param props 组件属性
 * @returns 抽屉组件
 */
const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  placement = 'right',
  size = 'medium',
  width,
  height,
  closable = true,
  maskClosable = true,
  keyboard = true,
  mask = true,
  maskStyle,
  style,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  footer,
  showFooter = false,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  confirmLoading = false,
  zIndex = 1000,
  destroyOnClose = false,
  transitionDuration = 300,
  push = false,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // 处理键盘事件
  useEffect(() => {
    if (!open || !keyboard) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, keyboard, onClose])

  // 处理焦点管理和页面推拽
  useEffect(() => {
    if (open) {
      // 保存当前焦点元素
      previousActiveElement.current = document.activeElement as HTMLElement

      // 将焦点移到抽屉
      setTimeout(() => {
        drawerRef.current?.focus()
      }, transitionDuration)

      // 禁止页面滚动
      document.body.style.overflow = 'hidden'

      // 推拽页面内容
      if (push) {
        const pushDistance = width || height || getDrawerSize(size, placement)
        const pushStyle = getPushStyle(placement, pushDistance)
        Object.assign(document.body.style, pushStyle)
      }
    } else {
      // 恢复焦点
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }

      // 恢复页面滚动和推拽
      document.body.style.overflow = ''
      if (push) {
        document.body.style.transform = ''
        document.body.style.transition = ''
      }
    }

    return () => {
      document.body.style.overflow = ''
      if (push) {
        document.body.style.transform = ''
        document.body.style.transition = ''
      }
    }
  }, [open, transitionDuration, push, placement, size, width, height])

  /**
   * 获取推拽样式
   * @param placement 方向
   * @param distance 推拽距离
   * @returns 推拽样式
   */
  const getPushStyle = (
    placement: DrawerPlacement,
    distance: string | number
  ) => {
    const distanceValue =
      typeof distance === 'number' ? `${distance}px` : distance

    const pushMap = {
      top: {
        transform: `translateY(${distanceValue})`,
        transition: `transform ${transitionDuration}ms ease-in-out`,
      },
      right: {
        transform: `translateX(-${distanceValue})`,
        transition: `transform ${transitionDuration}ms ease-in-out`,
      },
      bottom: {
        transform: `translateY(-${distanceValue})`,
        transition: `transform ${transitionDuration}ms ease-in-out`,
      },
      left: {
        transform: `translateX(${distanceValue})`,
        transition: `transform ${transitionDuration}ms ease-in-out`,
      },
    }

    return pushMap[placement]
  }

  /**
   * 处理遮罩层点击
   * @param e 点击事件
   */
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose()
    }
  }

  /**
   * 处理确认按钮点击
   */
  const handleOk = () => {
    if (onOk) {
      onOk()
    } else {
      onClose()
    }
  }

  /**
   * 处理取消按钮点击
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  // 如果未打开且设置了销毁时不保留DOM，则不渲染
  if (!open && destroyOnClose) {
    return null
  }

  // 计算抽屉尺寸
  const drawerSize = width || height || getDrawerSize(size, placement)
  const isHorizontal = placement === 'left' || placement === 'right'

  // 抽屉样式
  const drawerStyle = {
    ...getDrawerPositionStyle(placement),
    [isHorizontal ? 'width' : 'height']: drawerSize,
    transform: open
      ? getDrawerOpenTransform(placement)
      : getDrawerPositionStyle(placement).transform,
    transition: `transform ${transitionDuration}ms ease-in-out`,
    ...style,
  }

  return (
    <div
      className={cn(
        'fixed inset-0 transition-all',
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
      style={{
        zIndex,
        transitionDuration: `${transitionDuration}ms`,
      }}
      onClick={handleMaskClick}
    >
      {/* 遮罩层 */}
      {mask && (
        <div
          className={cn(
            'absolute inset-0 bg-black transition-opacity',
            open ? 'opacity-50' : 'opacity-0'
          )}
          style={{
            ...maskStyle,
            transitionDuration: `${transitionDuration}ms`,
          }}
        />
      )}

      {/* 抽屉主体 */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn('absolute bg-white shadow-xl flex flex-col', className)}
        style={drawerStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* 抽屉头部 */}
        {(title || closable) && (
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0',
              headerClassName
            )}
          >
            {title && (
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            )}
            {closable && (
              <button
                type='button'
                onClick={onClose}
                className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors'
                aria-label='关闭抽屉'
              >
                <X className='w-5 h-5' />
              </button>
            )}
          </div>
        )}

        {/* 抽屉内容 */}
        <div className={cn('flex-1 overflow-auto px-6 py-4', bodyClassName)}>
          {children}
        </div>

        {/* 抽屉底部 */}
        {(footer !== undefined || showFooter) && (
          <div
            className={cn(
              'flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0',
              footerClassName
            )}
          >
            {footer !== undefined ? (
              footer
            ) : showFooter ? (
              <>
                <button
                  type='button'
                  onClick={handleCancel}
                  disabled={confirmLoading}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {cancelText}
                </button>
                <button
                  type='button'
                  onClick={handleOk}
                  disabled={confirmLoading}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {confirmLoading ? '处理中...' : okText}
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Drawer
