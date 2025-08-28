/**
 * Toggle Switch 组件
 * 创建时间: 2025-08-20
 * 创建人: Erikwang
 * 描述: 滑动式开关组件，用于状态切换
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  /** 当前状态值 */
  checked: boolean;
  /** 状态改变回调函数 */
  onChange: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 组件大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 启用状态的标签文本 */
  checkedLabel?: string;
  /** 禁用状态的标签文本 */
  uncheckedLabel?: string;
  /** 是否显示标签 */
  showLabel?: boolean;
}

/**
 * Toggle Switch 组件
 * @param props - 组件属性
 * @returns JSX.Element
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
  checkedLabel = '启用',
  uncheckedLabel = '禁用',
  showLabel = false
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  /**
   * 获取尺寸相关的样式类
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-4',
          thumb: 'w-3 h-3',
          translate: 'translate-x-4'
        };
      case 'lg':
        return {
          container: 'w-14 h-7',
          thumb: 'w-6 h-6',
          translate: 'translate-x-7'
        };
      default: // md
        return {
          container: 'w-11 h-6',
          thumb: 'w-5 h-5',
          translate: 'translate-x-5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* 开关按钮 */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          // 基础样式
          'relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm',
          // 尺寸
          sizeClasses.container,
          // 状态颜色
          checked
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
            : 'bg-gray-200 hover:bg-gray-300 shadow-gray-100',
          // 禁用状态
          disabled && 'opacity-50 cursor-not-allowed hover:bg-gray-200 shadow-none'
        )}
      >
        {/* 滑动圆点 */}
        <span
          className={cn(
            // 基础样式
            'inline-block bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out border border-gray-100',
            // 尺寸
            sizeClasses.thumb,
            // 位置和阴影
            checked 
              ? `${sizeClasses.translate} shadow-lg` 
              : 'translate-x-0.5 shadow-md',
            // 悬停效果
            !disabled && 'hover:shadow-xl'
          )}
        />
      </button>

      {/* 状态标签 */}
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            checked ? 'text-green-600' : 'text-gray-500',
            disabled && 'opacity-50'
          )}
        >
          {checked ? checkedLabel : uncheckedLabel}
        </span>
      )}
    </div>
  );
};

export default ToggleSwitch;