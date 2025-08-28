/**
 * 通用加载组件
 * 支持多种加载样式、尺寸、位置等
 * @author Erikwang
 * @date 2025-08-20
 */

import { cn } from '../lib/utils'

/**
 * 加载器类型
 */
export type LoadingType =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'bars'
  | 'ring'
  | 'wave'

/**
 * 加载器尺寸
 */
export type LoadingSize = 'small' | 'medium' | 'large' | 'xlarge'

/**
 * 加载组件属性
 */
export interface LoadingProps {
  /** 是否显示加载 */
  loading?: boolean
  /** 加载器类型 */
  type?: LoadingType
  /** 加载器尺寸 */
  size?: LoadingSize
  /** 加载文本 */
  text?: string
  /** 是否显示文本 */
  showText?: boolean
  /** 文本位置 */
  textPosition?: 'bottom' | 'right'
  /** 加载器颜色 */
  color?: string
  /** 背景遮罩 */
  overlay?: boolean
  /** 遮罩透明度 */
  overlayOpacity?: number
  /** 自定义样式 */
  className?: string
  /** 内容区域样式 */
  contentClassName?: string
  /** 子组件 */
  children?: React.ReactNode
  /** 延迟显示时间(ms) */
  delay?: number
}

/**
 * 获取加载器尺寸样式
 * @param size 尺寸
 * @returns 样式类名
 */
const getLoadingSizeClass = (size: LoadingSize): string => {
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12',
  }
  return sizeMap[size]
}

/**
 * 获取文本尺寸样式
 * @param size 尺寸
 * @returns 样式类名
 */
const getTextSizeClass = (size: LoadingSize): string => {
  const sizeMap = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg',
  }
  return sizeMap[size]
}

/**
 * 旋转加载器
 */
const SpinnerLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-gray-300',
      getLoadingSizeClass(size),
      className
    )}
    style={{
      borderTopColor: color,
      borderRightColor: color,
    }}
  />
)

/**
 * 点状加载器
 */
const DotsLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => {
  const dotSize =
    size === 'small'
      ? 'w-1 h-1'
      : size === 'medium'
        ? 'w-1.5 h-1.5'
        : size === 'large'
          ? 'w-2 h-2'
          : 'w-3 h-3'

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn('rounded-full animate-pulse', dotSize)}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

/**
 * 脉冲加载器
 */
const PulseLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => (
  <div
    className={cn(
      'animate-pulse rounded-full',
      getLoadingSizeClass(size),
      className
    )}
    style={{ backgroundColor: color }}
  />
)

/**
 * 条状加载器
 */
const BarsLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => {
  const barHeight =
    size === 'small'
      ? 'h-3'
      : size === 'medium'
        ? 'h-4'
        : size === 'large'
          ? 'h-6'
          : 'h-8'
  const barWidth = 'w-1'

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={cn('animate-pulse', barWidth, barHeight)}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  )
}

/**
 * 环形加载器
 */
const RingLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => (
  <div className={cn('relative', getLoadingSizeClass(size), className)}>
    <div className='absolute inset-0 rounded-full border-2 border-gray-300' />
    <div
      className='absolute inset-0 rounded-full border-2 border-transparent animate-spin'
      style={{
        borderTopColor: color,
        borderRightColor: color,
      }}
    />
  </div>
)

/**
 * 波浪加载器
 */
const WaveLoader: React.FC<{
  size: LoadingSize
  color?: string
  className?: string
}> = ({ size, color = 'currentColor', className }) => {
  const waveHeight =
    size === 'small'
      ? 'h-2'
      : size === 'medium'
        ? 'h-3'
        : size === 'large'
          ? 'h-4'
          : 'h-6'

  return (
    <div className={cn('flex items-center space-x-0.5', className)}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={cn('w-0.5 animate-pulse', waveHeight)}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

/**
 * 渲染加载器
 * @param type 加载器类型
 * @param size 尺寸
 * @param color 颜色
 * @param className 样式类名
 * @returns 加载器组件
 */
const renderLoader = (
  type: LoadingType,
  size: LoadingSize,
  color?: string,
  className?: string
) => {
  const loaderProps = { size, color, className }

  switch (type) {
    case 'spinner':
      return <SpinnerLoader {...loaderProps} />
    case 'dots':
      return <DotsLoader {...loaderProps} />
    case 'pulse':
      return <PulseLoader {...loaderProps} />
    case 'bars':
      return <BarsLoader {...loaderProps} />
    case 'ring':
      return <RingLoader {...loaderProps} />
    case 'wave':
      return <WaveLoader {...loaderProps} />
    default:
      return <SpinnerLoader {...loaderProps} />
  }
}

/**
 * 通用加载组件
 * @param props 组件属性
 * @returns 加载组件
 */
const Loading: React.FC<LoadingProps> = ({
  loading = true,
  type = 'spinner',
  size = 'medium',
  text = '加载中...',
  showText = true,
  textPosition = 'bottom',
  color,
  overlay = false,
  overlayOpacity = 0.5,
  className,
  contentClassName,
  children,
  delay = 0,
}) => {
  // 如果不显示加载且没有子组件，返回null
  if (!loading && !children) {
    return null
  }

  // 如果不显示加载但有子组件，直接返回子组件
  if (!loading && children) {
    return <>{children}</>
  }

  // 加载器内容
  const loaderContent = (
    <div
      className={cn(
        'flex items-center justify-center',
        textPosition === 'bottom' ? 'flex-col space-y-2' : 'flex-row space-x-3',
        contentClassName
      )}
    >
      {renderLoader(type, size, color)}
      {showText && text && (
        <div className={cn('text-gray-600', getTextSizeClass(size))}>
          {text}
        </div>
      )}
    </div>
  )

  // 如果有子组件，使用相对定位的遮罩
  if (children) {
    return (
      <div className={cn('relative', className)}>
        {children}
        {loading && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              overlay && 'bg-white'
            )}
            style={{
              backgroundColor: overlay
                ? `rgba(255, 255, 255, ${overlayOpacity})`
                : undefined,
              animationDelay: delay ? `${delay}ms` : undefined,
            }}
          >
            {loaderContent}
          </div>
        )}
      </div>
    )
  }

  // 独立的加载组件
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        overlay && 'fixed inset-0 bg-white z-50',
        className
      )}
      style={{
        backgroundColor: overlay
          ? `rgba(255, 255, 255, ${overlayOpacity})`
          : undefined,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {loaderContent}
    </div>
  )
}

/**
 * 页面加载组件
 */
export const PageLoading: React.FC<{
  text?: string
  type?: LoadingType
  size?: LoadingSize
}> = ({ text = '页面加载中...', type = 'spinner', size = 'large' }) => (
  <Loading
    type={type}
    size={size}
    text={text}
    overlay
    className='min-h-screen'
  />
)

/**
 * 按钮加载组件
 */
export const ButtonLoading: React.FC<{
  loading?: boolean
  children: React.ReactNode
  type?: LoadingType
  size?: LoadingSize
}> = ({ loading = false, children, type = 'spinner', size = 'small' }) => (
  <div className='flex items-center space-x-2'>
    {loading && renderLoader(type, size, 'currentColor')}
    <span>{children}</span>
  </div>
)

/**
 * 内联加载组件
 */
export const InlineLoading: React.FC<{
  loading?: boolean
  text?: string
  type?: LoadingType
  size?: LoadingSize
}> = ({ loading = true, text, type = 'dots', size = 'small' }) => {
  if (!loading) return null

  return (
    <Loading
      type={type}
      size={size}
      text={text}
      showText={!!text}
      textPosition='right'
      className='inline-flex'
    />
  )
}

export default Loading
