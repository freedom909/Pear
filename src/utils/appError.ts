/**
 * 应用错误类
 * 用于创建统一格式的错误对象
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, string>;

  /**
   * 构造函数
   * @param statusCode HTTP状态码
   * @param message 错误消息
   * @param errors 详细错误信息（用于验证错误）
   */
  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // 标记为可操作错误，区分于编程错误
    this.errors = errors;

    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 创建400错误 - 错误请求
   * @param message 错误消息
   */
  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  /**
   * 创建401错误 - 未授权
   * @param message 错误消息
   */
  static unauthorized(message: string): AppError {
    return new AppError(401, message);
  }

  /**
   * 创建403错误 - 禁止访问
   * @param message 错误消息
   */
  static forbidden(message: string): AppError {
    return new AppError(403, message);
  }

  /**
   * 创建404错误 - 未找到
   * @param message 错误消息
   */
  static notFound(message: string): AppError {
    return new AppError(404, message);
  }

  /**
   * 创建409错误 - 冲突
   * @param message 错误消息
   */
  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  /**
   * 创建422错误 - 验证错误
   * @param message 错误消息
   * @param errors 详细错误信息
   */
  static validation(
    message: string,
    errors: Record<string, string>
  ): AppError {
    return new AppError(422, message, errors);
  }

  /**
   * 创建429错误 - 请求过多
   * @param message 错误消息
   */
  static tooManyRequests(message: string): AppError {
    return new AppError(429, message);
  }

  /**
   * 创建500错误 - 服务器内部错误
   * @param message 错误消息
   */
  static internal(message: string): AppError {
    return new AppError(500, message);
  }
}