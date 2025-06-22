/**
 * 应用程序基础错误类
 * 所有自定义错误都应继承此类
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    
    // 在开发环境中保留堆栈跟踪
    if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request 错误
 * 表示客户端请求无效
 */
export class BadRequestError extends AppError {
  constructor(message: string = '无效的请求', code: string = 'BAD_REQUEST', details?: any) {
    super(message, 400, code, true, details);
  }
}

/**
 * 401 Unauthorized 错误
 * 表示请求需要认证
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问', code: string = 'UNAUTHORIZED', details?: any) {
    super(message, 401, code, true, details);
  }
}

/**
 * 403 Forbidden 错误
 * 表示请求被服务器拒绝
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问', code: string = 'FORBIDDEN', details?: any) {
    super(message, 403, code, true, details);
  }
}

/**
 * 404 Not Found 错误
 * 表示请求的资源不存在
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源未找到', code: string = 'NOT_FOUND', details?: any) {
    super(message, 404, code, true, details);
  }
}

/**
 * 409 Conflict 错误
 * 表示请求与当前资源状态冲突
 */
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突', code: string = 'CONFLICT', details?: any) {
    super(message, 409, code, true, details);
  }
}

/**
 * 422 Unprocessable Entity 错误
 * 表示请求格式正确但语义错误
 */
export class ValidationError extends AppError {
  constructor(message: string = '数据验证失败', code: string = 'VALIDATION_ERROR', details?: any) {
    super(message, 422, code, true, details);
  }
}

/**
 * 500 Internal Server Error 错误
 * 表示服务器内部错误
 */
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误', code: string = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message, 500, code, false, details);
  }
}

/**
 * 503 Service Unavailable 错误
 * 表示服务器暂时不可用
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = '服务不可用', code: string = 'SERVICE_UNAVAILABLE', details?: any) {
    super(message, 503, code, false, details);
  }
}

/**
 * OAuth 认证错误
 */
export class OAuthError extends AppError {
  constructor(message: string = 'OAuth认证失败', code: string = 'OAUTH_ERROR', details?: any) {
    super(message, 401, code, true, details);
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string = '数据库操作失败', code: string = 'DATABASE_ERROR', details?: any) {
    super(message, 500, code, false, details);
  }
}

/**
 * 文件上传错误
 */
export class FileUploadError extends AppError {
  constructor(message: string = '文件上传失败', code: string = 'FILE_UPLOAD_ERROR', details?: any) {
    super(message, 400, code, true, details);
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁', code: string = 'RATE_LIMIT_EXCEEDED', details?: any) {
    super(message, 429, code, true, details);
  }
}

/**
 * 创建错误响应对象
 * @param error 错误对象
 * @returns 错误响应对象
 */
export const createErrorResponse = (error: Error) => {
  // 默认错误响应
  let response = {
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // 处理自定义错误
  if (error instanceof AppError) {
    response = {
      status: 'error',
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // 处理Mongoose验证错误
  if (error.name === 'ValidationError') {
    response = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '数据验证失败',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // 处理MongoDB重复键错误
  if ((error as any).code === 11000) {
    response = {
      status: 'error',
      code: 'DUPLICATE_KEY',
      message: '资源已存在',
...((error as any).keyValue && { details: (error as any).keyValue }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // 处理JWT错误
  if (error.name === 'JsonWebTokenError') {
    response = {
      status: 'error',
      code: 'INVALID_TOKEN',
      message: '无效的认证令牌',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // 处理JWT过期错误
  if (error.name === 'TokenExpiredError') {
    response = {
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: '认证令牌已过期',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  return response;
};