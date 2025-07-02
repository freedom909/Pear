//middleware/requestLogger.ts

import { Request, Response, NextFunction } from 'express';
import logger from './logger';
import { getFromContext } from './logger';

/**
 * 请求日志中间件配置接口
 */
interface RequestLoggerOptions {
  // 是否记录请求体
  logRequestBody?: boolean;
  // 是否记录响应体
  logResponseBody?: boolean;
  // 需要排除的路径
  excludePaths?: string[];
  // 需要排除的请求体字段
  excludeRequestFields?: string[];
  // 需要排除的响应体字段
  excludeResponseFields?: string[];
  // 请求体大小限制（字节）
  requestBodySizeLimit?: number;
  // 响应体大小限制（字节）
  responseBodySizeLimit?: number;
}

/**
 * 默认配置
 */
const defaultOptions: RequestLoggerOptions = {
  logRequestBody: true,
  logResponseBody: false,
  excludePaths: ['/health', '/metrics'],
  excludeRequestFields: ['password', 'token', 'authorization'],
  excludeResponseFields: ['token', 'refreshToken'],
  requestBodySizeLimit: 10000, // 10KB
  responseBodySizeLimit: 10000, // 10KB
};

/**
 * 清理对象中的敏感字段
 */
function sanitizeObject(obj: any, excludeFields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (excludeFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeObject(sanitized[key], excludeFields);
    }
  }

  return sanitized;
}

/**
 * 截断大字符串
 */
function truncateString(str: string, limit: number): string {
  if (str.length <= limit) {
    return str;
  }
  return `${str.substring(0, limit)}... [truncated ${str.length - limit} characters]`;
}

/**
 * 创建请求日志中间件
 */
export const createRequestLogger = (options: RequestLoggerOptions = {}) => {
  const config = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // 检查是否需要跳过日志记录
    if (config.excludePaths?.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const requestId = getFromContext<string>('requestId');
    const startTime = Date.now();
    const requestSize = req.headers['content-length']
      ? parseInt(req.headers['content-length'], 10)
      : 0;

    // 记录请求开始
    logger.info('Request started', {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      headers: sanitizeObject(req.headers, config.excludeRequestFields || []),
      requestSize,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // 如果配置了记录请求体且请求体不为空
    if (config.logRequestBody && req.body && Object.keys(req.body).length > 0) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length <= (config.requestBodySizeLimit || 0)) {
        logger.debug('Request body', {
          requestId,
          body: sanitizeObject(req.body, config.excludeRequestFields || []),
        });
      } else {
        logger.debug('Request body too large to log', {
          requestId,
          bodySize: bodyString.length,
        });
      }
    }

    // 捕获响应体
    if (config.logResponseBody) {
      const oldWrite = res.write;
      const oldEnd = res.end;
      const chunks: Buffer[] = [];

      res.write = function (chunk: any, ...args: any[]): boolean {
        chunks.push(Buffer.from(chunk));
        const [firstArg, ...restArgs] = [chunk, ...args];
        const encoding = restArgs[0] || 'utf8';
        const callback = restArgs[1];
        return oldWrite.apply(res, [firstArg, encoding, callback]);
      };

      res.end = function (chunk: any, ...args: any[]): any {
        if (chunk) {
          chunks.push(Buffer.from(chunk));
        }
        const responseBody = Buffer.concat(chunks).toString('utf8');

        // 记录响应体（如果大小在限制内）
        if (responseBody.length <= (config.responseBodySizeLimit || 0)) {
          try {
            const parsedBody = JSON.parse(responseBody);
            const sanitizedBody = sanitizeObject(
              parsedBody,
              config.excludeResponseFields || []
            );
            logger.debug('Response body', {
              requestId,
              body: sanitizedBody,
            });
          } catch {
            // 如果响应不是JSON，记录原始响应（可能被截断）
            logger.debug('Response body (raw)', {
              requestId,
              body: truncateString(
                responseBody,
                config.responseBodySizeLimit || 0
              ),
            });
          }
        } else {
          logger.debug('Response body too large to log', {
            requestId,
            bodySize: responseBody.length,
          });
        }

        const [firstArg, ...restArgs] = [chunk, ...args];
        const encoding = restArgs[0] || 'utf8';
        const callback = restArgs[1];
        return oldEnd.apply(res, [firstArg, encoding, callback]);
      };
    }

    // 在响应完成时记录
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const responseSize = res.get('content-length')
        ? parseInt(res.get('content-length') as string, 10)
        : 0;

      logger.info('Request completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        responseSize,
        responseHeaders: sanitizeObject(
          res.getHeaders(),
          config.excludeResponseFields || []
        ),
      });

      // 记录慢请求
      if (duration > 1000) {
        // 超过1秒的请求
        logger.warn('Slow request detected', {
          requestId,
          method: req.method,
          path: req.path,
          duration,
        });
      }
    });

    // 处理请求错误
    res.on('error', (error) => {
      logger.error('Request error occurred', {
        requestId,
        method: req.method,
        path: req.path,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    });

    next();
  };
};

export default createRequestLogger;
