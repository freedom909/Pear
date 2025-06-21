/**
 * 自定义错误响应类
 */
export class ErrorResponse extends Error {
  statusCode: number;
  isOperational: boolean;

  /**
   * 创建错误响应实例
   * @param message 错误消息
   * @param statusCode HTTP状态码
   * @param isOperational 是否为操作错误（默认为true）
   */
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // 确保正确的原型链
    Object.setPrototypeOf(this, ErrorResponse.prototype);

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // 记录错误创建
    if (process.env.NODE_ENV !== 'test') {
      const logger = require('./logger').default;
      logger.error(`${statusCode} - ${message}`);
    }
  }

  /**
   * 创建400 Bad Request错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static badRequest(message: string) {
    return new ErrorResponse(message, 400);
  }

  /**
   * 创建401 Unauthorized错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static unauthorized(message: string) {
    return new ErrorResponse(message, 401);
  }

  /**
   * 创建403 Forbidden错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static forbidden(message: string) {
    return new ErrorResponse(message, 403);
  }

  /**
   * 创建404 Not Found错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static notFound(message: string) {
    return new ErrorResponse(message, 404);
  }

  /**
   * 创建500 Internal Server Error错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static internalError(message: string) {
    return new ErrorResponse(message, 500);
  }

  /**
   * 创建503 Service Unavailable错误
   * @param message 错误消息
   * @returns ErrorResponse实例
   */
  static serviceUnavailable(message: string) {
    return new ErrorResponse(message, 503);
  }

  /**
   * 将错误转换为JSON格式
   * @returns 包含错误信息的JSON对象
   */
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
      isOperational: this.isOperational
    };
  }

 internal() {
    this.isOperational = true;
  }
}

/**
 * 错误类型接口
 */
export interface IError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any[];
  keyValue?: any;
  value?: string;
  path?: string;
  kind?: string;
}