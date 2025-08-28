/**
 * 数据缓存Hook
 * 实现5分钟智能缓存机制，避免重复API请求
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  loading: boolean;
  error: Error | null;
}

interface UseDataCacheOptions {
  cacheTime?: number; // 缓存时间，默认5分钟
  staleTime?: number; // 数据过期时间，默认1分钟
  retryCount?: number; // 重试次数，默认3次
  retryDelay?: number; // 重试延迟，默认1秒
}

// 全局缓存存储
const globalCache = new Map<string, CacheItem<any>>();

/**
 * 数据缓存Hook
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param options 配置选项
 * @returns 缓存数据和相关方法
 */
export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseDataCacheOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5分钟
    staleTime = 1 * 60 * 1000,  // 1分钟
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  /**
   * 检查缓存是否有效
   */
  const isCacheValid = useCallback((cacheItem: CacheItem<T>) => {
    const now = Date.now();
    return now - cacheItem.timestamp < cacheTime;
  }, [cacheTime]);

  /**
   * 检查数据是否过期
   */
  const isDataStale = useCallback((cacheItem: CacheItem<T>) => {
    const now = Date.now();
    return now - cacheItem.timestamp > staleTime;
  }, [staleTime]);

  /**
   * 获取数据
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheItem = globalCache.get(key) as CacheItem<T> | undefined;
    
    // 如果有有效缓存且不是强制刷新，直接使用缓存
    if (!forceRefresh && cacheItem && isCacheValid(cacheItem)) {
      if (!mountedRef.current) return;
      setData(cacheItem.data);
      setLoading(false);
      setError(cacheItem.error);
      
      // 如果数据过期，在后台刷新
      if (isDataStale(cacheItem) && !cacheItem.loading) {
        fetchData(true);
      }
      return;
    }

    // 如果正在加载，不重复请求
    if (cacheItem?.loading) {
      return;
    }

    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);

    // 更新缓存状态为加载中
    globalCache.set(key, {
      data: cacheItem?.data || null,
      timestamp: cacheItem?.timestamp || 0,
      loading: true,
      error: null
    });

    try {
      const result = await fetcher();
      
      if (!mountedRef.current) return;
      
      const newCacheItem: CacheItem<T> = {
        data: result,
        timestamp: Date.now(),
        loading: false,
        error: null
      };
      
      globalCache.set(key, newCacheItem);
      setData(result);
      setLoading(false);
      retryCountRef.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (!mountedRef.current) return;
      
      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(forceRefresh);
          }
        }, retryDelay * retryCountRef.current);
        return;
      }
      
      const errorCacheItem: CacheItem<T> = {
        data: cacheItem?.data || null,
        timestamp: cacheItem?.timestamp || 0,
        loading: false,
        error
      };
      
      globalCache.set(key, errorCacheItem);
      setError(error);
      setLoading(false);
      retryCountRef.current = 0;
    }
  }, [key, fetcher, isCacheValid, isDataStale, retryCount, retryDelay]);

  /**
   * 刷新数据
   */
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    globalCache.delete(key);
    setData(null);
    setError(null);
  }, [key]);

  /**
   * 手动设置数据（用于乐观更新）
   */
  const setOptimisticData = useCallback((newData: T) => {
    const cacheItem: CacheItem<T> = {
      data: newData,
      timestamp: Date.now(),
      loading: false,
      error: null
    };
    
    globalCache.set(key, cacheItem);
    setData(newData);
  }, [key]);

  // 组件挂载时获取数据
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    setOptimisticData,
    isStale: data ? isDataStale(globalCache.get(key) as CacheItem<T>) : false
  };
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  globalCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return {
    size: globalCache.size,
    keys: Array.from(globalCache.keys())
  };
}