import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/appError';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 默认错误状态码和消息
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails: any = {};

  // 如果是自定义应用错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = (err as any).details || {};
  } else {
    // 其他错误
    message = err.message || message;
  }

  // 记录错误日志
  logger.error(`${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    details: errorDetails,
    stack: err.stack,
  });

  // 在开发环境下返回更多错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(isDevelopment && { stack: err.stack }),
    ...(Object.keys(errorDetails).length > 0 && { details: errorDetails }),
  });
};