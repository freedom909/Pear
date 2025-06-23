import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';
import { ValidationError } from 'class-validator';

/**
 * 异步处理中间件 - 捕获异步函数中的错误
 * @param fn 异步函数
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 错误处理中间件
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误
  logger.error(err.stack || err.message);

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = `资源ID ${err.value} 格式不正确`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const message = '资源已存在，字段值必须唯一';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    const message = `输入数据验证失败: ${messages.join(', ')}`;
    error = new ErrorResponse(message, 400);
  }

  // 类验证器错误
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const messages = err
      .map((e: ValidationError) => Object.values(e.constraints || {}))
      .flat()
      .join(', ');
    const message = `输入数据验证失败: ${messages}`;
    error = new ErrorResponse(message, 400);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌';
    error = new ErrorResponse(message, 401);
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期';
    error = new ErrorResponse(message, 401);
  }

  // 返回错误响应
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误'
  });
};

/**
 * 404 处理中间件
 */
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new ErrorResponse(`找不到 ${req.originalUrl}`, 404);
  next(error);
};