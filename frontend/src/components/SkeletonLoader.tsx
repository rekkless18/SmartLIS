/**
 * 骨架屏加载组件
 * 用于在数据加载时提供更好的用户体验
 * @author Erikwang
 * @date 2025-08-20
 */

import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

/**
 * 骨架屏加载组件
 * @param rows 显示的行数
 * @param className 自定义样式类名
 * @returns 骨架屏组件
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  rows = 5, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;