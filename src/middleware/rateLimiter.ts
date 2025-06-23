import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';
import RedisStore from 'rate-limit-redis';
import redisClient from '../utils/redis';

/**
 * 创建速率限制器
 * @param windowMs 时间窗口（毫秒）
 * @param max 最大请求数
 * @param message 错误消息
 * @param skipFailedRequests 是否跳过失败的请求
 * @returns 速率限制中间件
 */
export const rateLimiter = (
  windowMs: number,
  max: number,
  message = '请求过于频繁，请稍后再试',
  skipFailedRequests = false
) => {
  const store = new RedisStore({
    // ❗ rate-limit-redis expects a sendCommand method:
    sendCommand: (...args: string[]) => (redisClient as any).sendCommand(args),
    prefix: 'rate_limit:', // optional prefix
  });

  return rateLimit({
    windowMs, // 时间窗口（毫秒）
    max, // 每个IP在时间窗口内的最大请求数
    message,
    skipFailedRequests, // 是否跳过失败的请求
    store,
    handler: (req: Request, _res: Response, next: NextFunction) => {
      logger.warn(`速率限制触发: IP ${req.ip} 超过限制`);
      next(new ErrorResponse(message, 429));
    },
    keyGenerator: (req: Request) => {
      // 使用IP地址和原始URL作为键
      return `${req.ip}:${req.originalUrl}`;
    }
  });
};

/**
 * 登录速率限制器（更严格）
 */
export const loginLimiter = rateLimiter(15 * 60 * 1000, 5, '登录尝试次数过多，请15分钟后再试');

/**
 * API速率限制器
 */
export const apiLimiter = rateLimiter(15 * 60 * 1000, 100);

/**
 * 严格API速率限制器
 */
export const strictApiLimiter = rateLimiter(60 * 1000, 30);

/**
 * 全局速率限制器
 */
export const globalLimiter = rateLimiter(60 * 60 * 1000, 1000, '请求总数超过限制，请1小时后再试');

/**
 * 公共端点速率限制器
 */
export const publicLimiter = rateLimiter(60 * 60 * 1000, 5000, '请求总数超过限制，请1小时后再试', true);

/**
 * 管理员端点速率限制器
 */
export const adminLimiter = rateLimiter(60 * 60 * 1000, 500, '请求总数超过限制，请1小时后再试');