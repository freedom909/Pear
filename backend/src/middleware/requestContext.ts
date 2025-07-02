//middleware/requestContext.ts

import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求上下文接口
 */
export interface RequestContext {
  /**
   * 请求ID
   */
  requestId: string;

  /**
   * 请求开始时间
   */
  startTime: number;

  /**
   * 用户ID（如果已认证）
   */
  userId?: string | number;

  /**
   * 自定义数据存储
   */
  store: Map<string, any>;
}

// 创建异步本地存储实例
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * 获取当前请求上下文
 * 如果在中间件链之外调用，将返回undefined
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * 获取当前请求ID
 * 如果在中间件链之外调用，将返回undefined
 */
export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

/**
 * 获取当前用户ID
 * 如果在中间件链之外调用或用户未认证，将返回undefined
 */
export function getUserId(): string | number | undefined {
  return getRequestContext()?.userId;
}

/**
 * 设置当前用户ID
 * @param userId 用户ID
 */
export function setUserId(userId: string | number): void {
  const context = getRequestContext();
  if (context) {
    context.userId = userId;
  }
}

/**
 * 从请求头中提取请求ID
 * 支持多种常见的请求ID头
 */
function extractRequestId(req: Request): string | undefined {
  return (
    req.header('X-Request-ID') ||
    req.header('X-Correlation-ID') ||
    req.header('Request-ID') ||
    undefined
  );
}

/**
 * 请求上下文中间件
 * 为每个请求创建一个唯一的上下文，包括：
 * - 请求ID（从请求头获取或生成新的）
 * - 开始时间
 * - 用户ID（初始为undefined，可以在认证后设置）
 * - 自定义数据存储
 */
export default function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 创建请求上下文
  const context: RequestContext = {
    requestId: extractRequestId(req) || uuidv4(),
    startTime: Date.now(),
    store: new Map(),
  };

  // 扩展请求对象
  req.id = context.requestId;
  req.context = context;

  // 添加请求ID到响应头
  res.setHeader('X-Request-ID', context.requestId);

  // 在异步本地存储中运行中间件链
  asyncLocalStorage.run(context, () => {
    next();
  });
}

// 扩展Express的Request类型定义
declare global {
  namespace Express {
    interface Request {
      id: string;
      context: RequestContext;
    }
  }
}
