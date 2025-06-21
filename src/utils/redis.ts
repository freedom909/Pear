import Redis from 'redis';
import { ErrorResponse } from './errorResponse.ts';
import  logger  from './logger.ts';
import { createClient, RedisClientType } from 'redis';
import { create } from 'domain';
// Redis配置接口
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: any;
}
  // 创建Redis客户端

let client: RedisClientType | null = null;// Cannot use namespace 'Redis' as a type.

/**
 * 初始化Redis连接
 */
export const initRedis = () => {
  try {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0')
    };

    // 如果有密码，添加密码
    if (process.env.REDIS_PASSWORD) {
      config.password = process.env.REDIS_PASSWORD;
    }

    // 如果是生产环境且使用TLS，添加TLS配置
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true') {
      config.tls = {};
    }

    redisClient = new Redis(config);

    // 监听连接事件
    redisClient.on('connect', () => {
      logger.info('Redis连接已建立');
    });

    // 监听错误事件
    redisClient.on('error', (err) => {
      logger.error('Redis错误:', err);
    });

    return redisClient;
  } catch (err) {
    logger.error('初始化Redis失败:', err);
    throw new ErrorResponse('Redis连接失败', 500);
  }
};

/**
 * 获取Redis客户端
 */
export const getRedisClient = () => {
  if (!redisClient) {
    throw new ErrorResponse('Redis客户端未初始化', 500);
  }
  return redisClient;
};

/**
 * 关闭Redis连接
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis连接已关闭');
  }
};

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 过期时间（秒）
 */
export const setCache = async (key: string, value: any, ttl?: number) => {
  try {
    const client = getRedisClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await client.setex(key, ttl, stringValue);
    } else {
      await client.set(key, stringValue);
    }
  } catch (err) {
    logger.error('设置缓存失败:', err);
    throw new ErrorResponse('缓存设置失败', 500);
  }
};

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存值
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (err) {
    logger.error('获取缓存失败:', err);
    throw new ErrorResponse('缓存获取失败', 500);
  }
};

/**
 * 删除缓存
 * @param key 缓存键
 */
export const deleteCache = async (key: string) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (err) {
    logger.error('删除缓存失败:', err);
    throw new ErrorResponse('缓存删除失败', 500);
  }
};

/**
 * 检查键是否存在
 * @param key 键名
 * @returns 是否存在
 */
export const exists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (err) {
    logger.error('检查键是否存在失败:', err);
    throw new ErrorResponse('检查键是否存在失败', 500);
  }
};

/**
 * 设置哈希表字段
 * @param key 哈希表键
 * @param field 字段名
 * @param value 字段值
 */
export const hset = async (key: string, field: string, value: any) => {
  try {
    const client = getRedisClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.hset(key, field, stringValue);
  } catch (err) {
    logger.error('设置哈希表字段失败:', err);
    throw new ErrorResponse('哈希表设置失败', 500);
  }
};

/**
 * 获取哈希表字段
 * @param key 哈希表键
 * @param field 字段名
 * @returns 字段值
 */
export const hget = async <T>(key: string, field: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.hget(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (err) {
    logger.error('获取哈希表字段失败:', err);
    throw new ErrorResponse('哈希表获取失败', 500);
  }
};

// 导出Redis客户端
export default redisClient;