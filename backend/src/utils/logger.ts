import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 定义日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// 将颜色添加到 winston
winston.addColors(colors);

// 定义日志格式
const format = winston.format.combine(
  // 添加错误堆栈跟踪
  winston.format.errors({ stack: true }),
  // 添加时间戳
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // 添加颜色
  winston.format.colorize({ all: true }),
  // 定义日志消息格式
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// 定义日志文件路径
const logsDir = path.join(process.cwd(), 'logs');

// 创建 transports
const transports = [
  // 错误日志
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  // 所有日志
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // 控制台输出
  new winston.transports.Console(),
];

// 创建 logger 实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// 添加认证相关的日志方法
interface AuthLogger extends winston.Logger {
  authSuccess: (userId: string, provider: string, details?: any) => void;
  authFailure: (provider: string, error: Error, details?: any) => void;
  authAttempt: (provider: string, details?: any) => void;
  accountLink: (userId: string, provider: string, details?: any) => void;
  accountUnlink: (userId: string, provider: string, details?: any) => void;
}

// 扩展 logger 实例
const authLogger = logger as AuthLogger;

// 添加认证相关的日志方法
authLogger.authSuccess = (userId: string, provider: string, details?: any) => {
  logger.info(`Authentication successful - User: ${userId}, Provider: ${provider}`, {
    event: 'auth_success',
    userId,
    provider,
    ...details,
  });
};

authLogger.authFailure = (provider: string, error: Error, details?: any) => {
  logger.error(`Authentication failed - Provider: ${provider}, Error: ${error.message}`, {
    event: 'auth_failure',
    provider,
    error,
    ...details,
  });
};

authLogger.authAttempt = (provider: string, details?: any) => {
  logger.info(`Authentication attempt - Provider: ${provider}`, {
    event: 'auth_attempt',
    provider,
    ...details,
  });
};

authLogger.accountLink = (userId: string, provider: string, details?: any) => {
  logger.info(`Account linked - User: ${userId}, Provider: ${provider}`, {
    event: 'account_link',
    userId,
    provider,
    ...details,
  });
};

authLogger.accountUnlink = (userId: string, provider: string, details?: any) => {
  logger.info(`Account unlinked - User: ${userId}, Provider: ${provider}`, {
    event: 'account_unlink',
    userId,
    provider,
    ...details,
  });
};

// 导出 logger 实例
export { authLogger as logger };