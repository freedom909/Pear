/**
 * 应用错误类
 * 用于创建统一格式的错误对象
 */
import { ErrorCode, ErrorCodeToStatusCode } from './error-code';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  /**
   * 构造函数
   */
  constructor(options: { message: string; code: ErrorCode; details?: any }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.statusCode = ErrorCodeToStatusCode[options.code] ?? 500;

    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 400错误 - 错误请求
   */
  static badRequest(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.BAD_REQUEST,
      details,
    });
  }

  /**
   * 401错误 - 未授权
   */
  static unauthorized(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.UNAUTHORIZED,
      details,
    });
  }

  /**
   * 403错误 - 禁止访问
   */
  static forbidden(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.FORBIDDEN,
      details,
    });
  }

  /**
   * 404错误 - 未找到
   */
  static notFound(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.NOT_FOUND,
      details,
    });
  }

  /**
   * 409错误 - 冲突
   */
  static conflict(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.STATE_CONFLICT,
      details,
    });
  }

  /**
   * 422错误 - 验证错误
   */
  static validation(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.VALIDATION_ERROR,
      details,
    });
  }

  /**
   * 429错误 - 请求过多
   */
  static tooManyRequests(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      details,
    });
  }

  /**
   * 500错误 - 服务器内部错误
   */
  static internal(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details,
    });
  }

  /**
   * 409错误 - 重复记录
   */
  static duplicateEntry(message: string, details?: any): AppError {
    return new AppError({
      message,
      code: ErrorCode.DUPLICATE_ENTRY,
      details,
    });
  }
}
