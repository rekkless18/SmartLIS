/**
 * 虚拟滚动列表组件
 * 用于优化大数据量列表的渲染性能
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // 预渲染的额外项目数量
}

/**
 * 虚拟滚动列表组件
 * @param items 数据项数组
 * @param itemHeight 每个项目的高度
 * @param containerHeight 容器高度
 * @param renderItem 渲染项目的函数
 * @param className 自定义样式类名
 * @param overscan 预渲染的额外项目数量，默认为5
 * @returns 虚拟滚动列表组件
 */
function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 计算可见范围内的项目索引
   */
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length - 1);
    
    // 添加overscan以提供更流畅的滚动体验
    const startWithOverscan = Math.max(0, startIndex - overscan);
    const endWithOverscan = Math.min(items.length - 1, endIndex + overscan);
    
    return {
      start: startWithOverscan,
      end: endWithOverscan
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  /**
   * 获取可见项目列表
   */
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  /**
   * 处理滚动事件
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  /**
   * 计算总高度
   */
  const totalHeight = items.length * itemHeight;

  /**
   * 计算偏移量
   */
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={actualIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;