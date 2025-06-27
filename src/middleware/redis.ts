import { createClient, RedisClientType } from 'redis';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import logger from './logger';

// Redis配置接口
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: any;
}

// Redis客户端
let redisClient: RedisClientType | null = null;
// 创建Redis客户端
export const getRedisClient = async (): Promise<RedisClientType> => {


  try {
    // Explicitly type-cast the result of initRedis to RedisClientType
    redisClient = await initRedis() as RedisClientType;
  } catch (err) {
    logger.error('初始化Redis失败:', err);
    throw new AppError({
      message: '初始化Redis失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    });
  }
  if (!redisClient) {
    throw new AppError({
      message: 'Redis客户端未初始化',
      code: ErrorCode.INTERNAL_SERVER_ERROR
    });
  }
  return redisClient;
};

/**
/**
 * 初始化Redis连接
 */
export const initRedis = async () => {
  try {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0')
    };

    if (process.env.REDIS_PASSWORD) {
      config.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true') {
      config.tls = {};
    }

    const client = createClient(config) as RedisClientType;

    client.on('connect', () => {
      logger.info('Redis连接已建立');
    });

    client.on('error', (err) => {
      logger.error('Redis错误:', err);
    });

    await client.connect();
    return client;
  } catch (err) {
    logger.error('初始化Redis失败:', err);
    throw new AppError({
      message: '初始化Redis失败',

      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message,
     
    });
  }
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
      const redisClientInstance = await client as RedisClientType;
      await redisClientInstance.setEx(key, ttl, stringValue);
    } else {
      const redisClientInstance = await client;
      await redisClientInstance.set(key, stringValue);
    }
  } catch (err) {
    logger.error('设置缓存失败:', err);
    throw new AppError({
      message: '缓存设置失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    });
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
    const redisClientInstance = await client;
    const value = await redisClientInstance.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (err) {
    logger.error('获取缓存失败:', err);
    throw new AppError({
      message: '缓存获取失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    })
  }
};

/**
 * 删除缓存
 * @param key 缓存键
 */
export const deleteCache = async (key: string) => {
  try {
    const client = getRedisClient() ;
    const redisClientInstance = await client as RedisClientType;
    await redisClientInstance.del(key);
  } catch (err) {
    logger.error('删除缓存失败:', err);
    throw new AppError({
      message: '缓存删除失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    });
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
    const redisClientInstance = await client as RedisClientType;
    const result = await redisClientInstance.exists(key);
    return result === 1;
  } catch (err) {
    logger.error('检查键是否存在失败:', err);
    throw new AppError({
      message: '检查键是否存在失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    });
  } 

  };

/**
 * 获取哈希表所有字段
 * @param key 哈希表键
 * @returns 字段名和字段值
};

/**
 * 设置哈希表字段
 * @param key 哈希表键
 * @param field 字段名
 * @param value 字段值
 */
export const hset = async (key: string, field: string, value: any) => {
  try {
    const client = getRedisClient()||{};
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const redisClientInstance = await client as RedisClientType;
    await redisClientInstance.hSet(key, field, stringValue);
  } catch (err) {
    logger.error('设置哈希表字段失败:', err);
        throw new AppError({
          message: '哈希表设置失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: (err as unknown as Error).message
        });
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
    const client = getRedisClient() ;
    const redisClientInstance = await client as RedisClientType;
    const value = await redisClientInstance.hGet(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (err) {
    logger.error('获取哈希表字段失败:', err);
    throw new AppError({
      message: '哈希表获取失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: (err as unknown as Error).message
    });
  }
};

// 导出Redis客户端
export default redisClient;