import winston from 'winston';
import path from 'path';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { AsyncLocalStorage } from 'async_hooks';
import os from 'os';
import fs from 'fs';
const { combine } = format;

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 创建请求上下文存储
export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

// 敏感字段列表，用于日志脱敏
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'privateKey',
  'authorization',
  'cookie',
  'sessionId',
  'ssn',
  'creditCard',
  'cardNumber'
];

// 日志级别枚举
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// 日志级别配置
const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);

// 是否启用JSON格式日志
const USE_JSON_FORMAT = process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production';

/**
 * 从异步本地存储中获取上下文
 */
const getContextData = () => {
  try {
    const store = asyncLocalStorage.getStore();
    return store ? Object.fromEntries(store.entries()) : {};
  } catch (error) {
    return {};
  }
};

/**
 * 脱敏敏感数据
 */
const sanitizeData = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }
    
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * 格式化错误对象
 */
const formatError = (error: Error): Record<string, any> => {
  if (!error) return {};
  
  return {
    message: error.message,
    name: error.name,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    ...(error as any)
  };
};

/**
 * 自定义格式化器，添加上下文数据
 */
const addContextFormat = format((info) => {
  const contextData = getContextData();
  return {
    ...info,
    ...contextData,
    context: contextData,
    hostname: os.hostname(),
    pid: process.pid,
    service: process.env.SERVICE_NAME || 'pear-api'
  };
});

/**
 * 自定义格式化器，处理错误对象
 */
const errorFormat = format((info) => {
  if (info.error instanceof Error) {
    info.error = formatError(info.error);
  }
  return info;
});

/**
 * 自定义格式化器，脱敏敏感数据
 */
const sanitizeFormat = format((info) => {
  return sanitizeData(info);
});

// 创建基本格式
const baseFormat = combine(
  errorFormat(),
  sanitizeFormat(),
  addContextFormat(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true })
);

// 控制台格式
const consoleFormat = combine(
  baseFormat,
  USE_JSON_FORMAT
    ? format.json()
    : combine(
        format.colorize(),
        format.align(),
        format.printf(({ timestamp, level, message, context, error, ...rest }) => {
          const contextStr = context && Object.keys(context).length 
            ? `[${Object.entries(context)
                .filter(([key]) => ['requestId', 'userId', 'traceId'].includes(key))
                .map(([key, val]) => `${key}=${val}`)
                .join(', ')}]` 
            : '';
          
          const restStr = Object.keys(rest).length && !['context', 'error', 'level', 'message', 'timestamp'].some(k => k in rest)
            ? `\n${JSON.stringify(rest, null, 2)}`
            : '';
          
          const errorStr = error ? `\n${typeof error === 'object' ? JSON.stringify(error, null, 2) : error}` : '';
          
          return `${timestamp} [${level}]${contextStr}: ${message}${errorStr}${restStr}`;
        })
      )
);

// 文件格式
const fileFormat = combine(
  baseFormat,
  format.json()
);

// 控制台传输配置
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: LOG_LEVEL
});

// 文件传输配置
const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  level: LOG_LEVEL
});

// 错误文件传输配置
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
  level: LogLevel.ERROR
});

// 创建日志记录器
const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  defaultMeta: { 
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    consoleTransport,
    fileTransport,
    errorFileTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat
    }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat
    }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  exitOnError: false
});

/**
 * 设置日志级别
 * @param level 日志级别
 */
export const setLogLevel = (level: LogLevel) => {
  logger.transports.forEach((transport) => {
    transport.level = level;
  });
};

/**
 * 创建请求上下文
 * @param data 上下文数据
 * @param callback 回调函数
 */
export const withContext = <T>(data: Record<string, any>, callback: () => T): T => {
  const store = new Map<string, any>();
  for (const [key, value] of Object.entries(data)) {
    store.set(key, value);
  }
  return asyncLocalStorage.run(store, callback);
};

/**
 * 向当前上下文添加数据
 * @param key 键
 * @param value 值
 */
export const addToContext = (key: string, value: any): void => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set(key, value);
  }
};

/**
 * 从当前上下文获取数据
 * @param key 键
 */
export const getFromContext = <T>(key: string): T | undefined => {
  const store = asyncLocalStorage.getStore();
  return store ? store.get(key) as T : undefined;
};

/**
 * 日志流用于morgan中间件
 */
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

/**
 * 创建子日志记录器，带有固定上下文
 * @param context 上下文数据
 */
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

export default logger;