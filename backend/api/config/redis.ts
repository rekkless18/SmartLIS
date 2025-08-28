/**
 * Redis配置和连接管理
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { createClient, RedisClientType } from 'redis';
import logger from './logger.js';

// Redis客户端实例
let redisClient: RedisClientType | null = null;

/**
 * 创建Redis连接
 * @returns Redis客户端实例
 */
export const createRedisConnection = async (): Promise<RedisClientType> => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    // 错误处理
    client.on('error', (err) => {
      logger.error('Redis连接错误:', err);
    });

    client.on('connect', () => {
      logger.info('Redis连接已建立');
    });

    client.on('ready', () => {
      logger.info('Redis客户端已就绪');
    });

    client.on('end', () => {
      logger.info('Redis连接已关闭');
    });

    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    logger.error('创建Redis连接失败:', error);
    throw error;
  }
};

/**
 * 获取Redis客户端实例
 * @returns Redis客户端实例或null
 */
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

/**
 * 测试Redis连接
 * @returns 连接状态
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    if (!redisClient) {
      await createRedisConnection();
    }
    
    if (redisClient) {
      await redisClient.ping();
      logger.info('Redis连接测试成功');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Redis连接测试失败:', error);
    return false;
  }
};

/**
 * 关闭Redis连接
 */
export const closeRedisConnection = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis连接已关闭');
    }
  } catch (error) {
    logger.error('关闭Redis连接失败:', error);
  }
};

/**
 * Redis缓存工具类
 */
export class RedisCache {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error(`设置缓存失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param key 键
   * @returns 缓存值
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error(`获取缓存失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 键
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`删除缓存失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`检查缓存键存在性失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param key 键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`设置缓存过期时间失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取键的剩余过期时间
   * @param key 键
   * @returns 剩余过期时间（秒），-1表示永不过期，-2表示键不存在
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`获取缓存过期时间失败 [${key}]:`, error);
      return -2;
    }
  }
}

// 导出默认的Redis配置
export default {
  createConnection: createRedisConnection,
  getClient: getRedisClient,
  testConnection: testRedisConnection,
  closeConnection: closeRedisConnection,
  RedisCache,
};