/**
 * 防抖Hook
 * 用于优化搜索和其他频繁触发的操作
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 防抖Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒），默认300ms
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedValue;
}

/**
 * 防抖回调Hook
 * @param callback 需要防抖的回调函数
 * @param delay 延迟时间（毫秒），默认300ms
 * @param deps 依赖数组
 * @returns 防抖后的回调函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const timerRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 设置新的定时器
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * 搜索防抖Hook
 * 专门用于搜索场景的防抖处理
 * @param searchTerm 搜索词
 * @param onSearch 搜索回调函数
 * @param delay 延迟时间（毫秒），默认300ms
 * @param minLength 最小搜索长度，默认0
 */
export function useSearchDebounce(
  searchTerm: string,
  onSearch: (term: string) => void,
  delay: number = 300,
  minLength: number = 0
) {
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const previousTermRef = useRef('');

  useEffect(() => {
    // 如果搜索词没有变化，不执行搜索
    if (debouncedSearchTerm === previousTermRef.current) {
      return;
    }

    // 如果搜索词长度小于最小长度，清空搜索结果
    if (debouncedSearchTerm.length < minLength) {
      if (previousTermRef.current.length >= minLength) {
        onSearch('');
      }
      previousTermRef.current = debouncedSearchTerm;
      setIsSearching(false);
      return;
    }

    // 执行搜索
    setIsSearching(true);
    onSearch(debouncedSearchTerm);
    previousTermRef.current = debouncedSearchTerm;
    
    // 搜索完成后重置状态
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, onSearch, minLength]);

  // 检查是否正在等待防抖
  const isPending = searchTerm !== debouncedSearchTerm;

  return {
    debouncedSearchTerm,
    isSearching,
    isPending
  };
}

export default useDebounce;