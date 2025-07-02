import { SYSTEM_CONFIG } from '../config';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none',
}

/**
 * 日志级别权重
 */
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.NONE]: 4,
};

/**
 * API错误响应接口
 */
export interface ApiErrorResponse {
  success: boolean;
  message?: string;
  error?: any;
  errors?: Record<string, string>;
}

/**
 * 日志工具类
 *
 * 提供统一的日志记录接口
 */
class Logger {
  namespace: string;
  level: LogLevel;
  isDev: boolean;
  isDebug: boolean;

  /**
   * 构造函数
   *
   * @param namespace - 日志命名空间
   * @param level - 日志级别
   */
  constructor(namespace = 'app', level = SYSTEM_CONFIG.LOG_LEVEL as LogLevel) {
    this.namespace = namespace;
    this.level = level;
    this.isDev = SYSTEM_CONFIG.IS_DEV;
    this.isDebug = SYSTEM_CONFIG.DEBUG;
  }

  /**
   * 设置日志级别
   *
   * @param level - 日志级别
   */
  setLevel(level: LogLevel): void {
    if (Object.values(LogLevel).includes(level)) {
      this.level = level;
    }
  }

  /**
   * 检查是否应该记录指定级别的日志
   *
   * @param level - 日志级别
   * @returns 是否应该记录
   */
  shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.level];
  }

  /**
   * 格式化日志消息
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @returns 格式化后的日志消息
   */
  formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}`;
  }

  /**
   * 记录调试级别日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message);

      if (this.isDev || this.isDebug) {
        console.debug(formattedMessage);
        if (data !== undefined) {
          console.debug(data);
        }
      }
    }
  }

  /**
   * 记录信息级别日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message);

      console.info(formattedMessage);
      if (data !== undefined) {
        console.info(data);
      }
    }
  }

  /**
   * 记录警告级别日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message);

      console.warn(formattedMessage);
      if (data !== undefined) {
        console.warn(data);
      }
    }
  }

  /**
   * 记录错误级别日志
   *
   * @param message - 日志消息
   * @param error - 错误对象或附加数据
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message);

      console.error(formattedMessage);
      if (error !== undefined) {
        console.error(error);
      }
    }
  }

  /**
   * 记录性能计时开始
   *
   * @param label - 计时标签
   */
  time(label: string): void {
    if (this.isDev || this.isDebug) {
      console.time(`[${this.namespace}] ${label}`);
    }
  }

  /**
   * 记录性能计时结束
   *
   * @param label - 计时标签
   */
  timeEnd(label: string): void {
    if (this.isDev || this.isDebug) {
      console.timeEnd(`[${this.namespace}] ${label}`);
    }
  }

  /**
   * 创建子日志记录器
   *
   * @param subNamespace - 子命名空间
   * @returns 子日志记录器
   */
  createSubLogger(subNamespace: string): Logger {
    return new Logger(`${this.namespace}:${subNamespace}`, this.level);
  }
}

/**
 * 错误处理工具类
 *
 * 提供统一的错误处理接口
 */
export class ErrorHandler {
  logger: Logger;

  /**
   * 构造函数
   *
   * @param logger - 日志记录器
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * 处理API错误
   *
   * @param error - 错误对象
   * @param fallbackMessage - 默认错误消息
   * @returns 处理结果
   */
  handleApiError(
    error: any,
    fallbackMessage = '操作失败，请稍后重试'
  ): ApiErrorResponse {
    let message = fallbackMessage;

    if (error.data && error.data.message) {
      message = error.data.message;
    } else if (error.message) {
      message = error.message;
    }

    this.logger.error('API错误', error);

    return {
      success: false,
      message,
      error,
    };
  }

  /**
   * 处理通用错误
   *
   * @param error - 错误对象
   * @param context - 错误上下文
   * @param fallbackMessage - 默认错误消息
   * @returns 处理结果
   */
  handleError(
    error: Error | any,
    context = '',
    fallbackMessage = '发生错误，请稍后重试'
  ): ApiErrorResponse {
    let message = fallbackMessage;

    if (error.message) {
      message = error.message;
    }

    const logMessage = context ? `${context}: ${message}` : message;
    this.logger.error(logMessage, error);

    return {
      success: false,
      message,
      error,
    };
  }

  /**
   * 处理表单验证错误
   *
   * @param errors - 验证错误对象
   * @returns 处理结果
   */
  handleValidationError(errors: Record<string, string>): ApiErrorResponse {
    const firstError = Object.values(errors)[0];
    const message = firstError || '表单验证失败';

    this.logger.warn('表单验证错误', errors);

    return {
      success: false,
      message,
      errors,
    };
  }
}

// 创建默认日志记录器
const logger = new Logger();

// 创建默认错误处理器
export const errorHandler = new ErrorHandler(logger);

export default logger;
