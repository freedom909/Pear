/**
 * errors/httpError.ts
 * 应用程序基础错误类
 * 所有自定义错误都应继承此类
 */

import { ErrorCode, ErrorCodeToStatusCode } from './error-code';

export class HttpError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = ErrorCodeToStatusCode[code] ?? 500;
    this.isOperational = isOperational;
    this.details = details;

    if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request 错误
 */
export class BadRequestError extends HttpError {
  constructor(message = '无效的请求', details?: any) {
    super(message, ErrorCode.BAD_REQUEST, true, details);
  }
}

/**
 * 401 Unauthorized 错误
 */
export class UnauthorizedError extends HttpError {
  constructor(message = '未授权访问', details?: any) {
    super(message, ErrorCode.UNAUTHORIZED, true, details);
  }
}

/**
 * 403 Forbidden 错误
 */
export class ForbiddenError extends HttpError {
  constructor(message = '禁止访问', details?: any) {
    super(message, ErrorCode.FORBIDDEN, true, details);
  }
}

/**
 * 404 Not Found 错误
 */
export class NotFoundError extends HttpError {
  constructor(message = '资源未找到', details?: any) {
    super(message, ErrorCode.NOT_FOUND, true, details);
  }
}

/**
 * 409 Conflict 错误
 */
export class ConflictError extends HttpError {
  constructor(message = '资源冲突', details?: any) {
    super(message, ErrorCode.STATE_CONFLICT, true, details);
  }
}

/**
 * 422 Unprocessable Entity 错误
 */
export class ValidationError extends HttpError {
  constructor(message = '数据验证失败', details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

/**
 * 500 Internal Server Error 错误
 */
export class InternalServerError extends HttpError {
  constructor(message = '服务器内部错误', details?: any) {
    super(message, ErrorCode.INTERNAL_SERVER_ERROR, false, details);
  }
}

/**
 * 503 Service Unavailable 错误
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message = '服务不可用', details?: any) {
    super(message, ErrorCode.SERVICE_UNAVAILABLE, false, details);
  }
}

/**
 * OAuth 认证错误
 */
export class OAuthError extends HttpError {
  constructor(message = 'OAuth认证失败', details?: any) {
    super(message, ErrorCode.UNAUTHORIZED, true, details);
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends HttpError {
  constructor(message = '数据库操作失败', details?: any) {
    super(message, ErrorCode.DATABASE_ERROR, false, details);
  }
}

/**
 * 文件上传错误
 */
export class FileUploadError extends HttpError {
  constructor(message = '文件上传失败', details?: any) {
    super(message, ErrorCode.INVALID_INPUT, true, details);
  }
}

/**
 * 429 Too Many Requests 错误
 */
export class RateLimitError extends HttpError {
  constructor(message = '请求过于频繁', details?: any) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, true, details);
  }
}


export class AuthenticationError extends HttpError {
  constructor(message = '认证失败', details?: any) {
    super(message, ErrorCode.UNAUTHORIZED, true, details);
  }
}
/**
 * 创建错误响应对象
 */
export const createErrorResponse = (error: Error) => {
  const isDev = process.env.NODE_ENV === 'development';

  let response = {
    status: 'error',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: '服务器内部错误',
    ...(isDev && { stack: error.stack }),
  };

  // HttpError
  if (error instanceof HttpError) {
    response = {
      status: 'error',
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(isDev && { stack: error.stack }),
    };
  }

  // Mongoose ValidationError
  if (error.name === 'ValidationError') {
    response = {
      status: 'error',
      code: ErrorCode.VALIDATION_ERROR,
      message: '数据验证失败',
      ...(isDev && { stack: error.stack }),
    };
  }

  // MongoDB Duplicate Key
  if ((error as any).code === 11000) {
    response = {
      status: 'error',
      code: ErrorCode.DUPLICATE_ENTRY,
      message: '资源已存在',
      ...((error as any).keyValue && { details: (error as any).keyValue }),
      ...(isDev && { stack: error.stack }),
    };
  }

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    response = {
      status: 'error',
      code: ErrorCode.INVALID_TOKEN,
      message: '无效的认证令牌',
      ...(isDev && { stack: error.stack }),
    };
  }

  if (error.name === 'TokenExpiredError') {
    response = {
      status: 'error',
      code: ErrorCode.TOKEN_EXPIRED,
      message: '认证令牌已过期',
      ...(isDev && { stack: error.stack }),
    };
  }

  return response;
};
