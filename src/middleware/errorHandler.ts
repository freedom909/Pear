//errorHandler.ts

import { Request, Response, NextFunction } from 'express';

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from './logger';
import {AppError} from '../errors/appError';
import { ErrorCode, ErrorCodeToStatusCode } from '../errors/error-code';
import { ValidationError } from 'express-validator';

/**
 * 错误响应接口
 */
interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * 统一的错误处理中间件
 */
export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 准备错误响应
  const errorResponse: ErrorResponse = {
    success: false,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error'
  };

  // 获取错误堆栈（仅在开发环境中）
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  // 处理不同类型的错误
  if (err instanceof AppError) {
    // 处理应用程序错误
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    errorResponse.details = err.details;
    if (stack) errorResponse.stack = stack;

  } else if (Array.isArray(err) && err.every((item): item is ValidationError => 'param' in item && 'msg' in item && 'value' in item)) {
    // 处理验证错误
    errorResponse.code = ErrorCode.VALIDATION_ERROR;
    errorResponse.message = 'Validation failed';
errorResponse.details = err.map((validationError) => ({
  param: validationError.param,
  msg: validationError.msg,
  value: validationError.value
}));

  } else if (err instanceof JsonWebTokenError) {
    // 处理JWT错误
    if (err instanceof TokenExpiredError) {
      errorResponse.code = ErrorCode.TOKEN_EXPIRED;
      errorResponse.message = 'Token has expired';
    } else {
      errorResponse.code = ErrorCode.INVALID_TOKEN;
      errorResponse.message = 'Invalid token';
    }

  } else if (err instanceof SyntaxError && err.message.includes('JSON')) {
    // 处理JSON解析错误
    errorResponse.code = ErrorCode.BAD_REQUEST;
    errorResponse.message = 'Invalid JSON format';

  } else if (err instanceof URIError) {
    // 处理URI错误
    errorResponse.code = ErrorCode.BAD_REQUEST;
    errorResponse.message = 'Invalid URI format';

  } else {
    // 处理未知错误
    errorResponse.message = err.message || 'An unexpected error occurred';
    if (stack) errorResponse.stack = stack;

    // 记录未知错误
    logger.error('Unhandled error:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      requestId: (req as any).id
    });
  }

  // 获取HTTP状态码
  const statusCode = ErrorCodeToStatusCode[errorResponse.code as ErrorCode] || 500;

  // 记录错误日志（排除404错误）
  if (statusCode !== 404) {
    logger.error(`${statusCode} - ${errorResponse.message}`, {
      code: errorResponse.code,
      details: errorResponse.details,
      url: req.originalUrl,
      method: req.method,
      requestId: (req as any).id,
      userId: req.user ? (req.user as any).id : 'unknown'
    });
  }

  // 发送错误响应
  res.status(statusCode).json(errorResponse);
}

/**
 * 包装异步路由处理器以自动捕获错误
 * 
 * @param fn 异步路由处理器
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};