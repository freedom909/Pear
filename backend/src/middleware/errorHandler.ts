import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import logger from './logger';

/**
 * 错误处理中间件
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // 处理Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = '数据验证失败';
    const details = {
      field: (err as any).path || 'unknown',
      message: err.message,
    };
    
    return res.status(422).json({
      status: 'error',
      code: ErrorCode.VALIDATION_ERROR,
      message,
      details,
    });
  }

  // 处理MongoDB重复键错误
  if ((err as any).code === 11000) {
    return res.status(409).json({
      status: 'error',
      code: ErrorCode.DUPLICATE_ENTRY,
      message: '资源已存在',
      details: (err as any).keyValue || {},
    });
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: ErrorCode.INVALID_TOKEN,
      message: '无效的认证令牌',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: ErrorCode.TOKEN_EXPIRED,
      message: '认证令牌已过期',
    });
  }

  // 处理自定义AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // 处理其他错误
  const statusCode = 500;
  const message = 
    process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message;

  const response: any = {
    status: 'error',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message,
  };

  // 开发环境添加堆栈跟踪
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  logger.error('Unhandled error', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    },
  });

  return res.status(statusCode).json(response);
}

export default errorHandler;