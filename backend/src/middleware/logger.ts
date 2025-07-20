// logger.ts (merged version)
import winston from 'winston';
import path from 'path';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { AsyncLocalStorage } from 'async_hooks';
import os from 'os';
import fs from 'fs';

const { combine } = format;

// Create log directory
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Context storage
export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

// Redacted fields
const SENSITIVE_FIELDS = [
  'password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey',
  'privateKey', 'authorization', 'cookie', 'sessionId', 'ssn', 'creditCard', 'cardNumber',
];

// Enum for log levels
export enum LogLevel {
  ERROR = 'error', WARN = 'warn', INFO = 'info', HTTP = 'http',
  VERBOSE = 'verbose', DEBUG = 'debug', SILLY = 'silly',
}

const LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);

const USE_JSON_FORMAT =
  process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production';

// Get context data
const getContextData = () => {
  try {
    const store = asyncLocalStorage.getStore();
    return store ? Object.fromEntries(store.entries()) : {};
  } catch {
    return {};
  }
};

// Sanitize sensitive fields
const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'object') {
    if (Array.isArray(data)) return data.map(sanitizeData);
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return data;
};

const formatError = (error: Error) => ({
  message: error.message,
  name: error.name,
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  ...(error as any),
});

// Custom formats
const addContextFormat = format(info => {
  const contextData = getContextData();
  return {
    ...info,
    ...contextData,
    context: contextData,
    hostname: os.hostname(),
    pid: process.pid,
    service: process.env.SERVICE_NAME || 'pear-api',
  };
});

const errorFormat = format(info => {
  if (info.error instanceof Error) {
    info.error = formatError(info.error);
  }
  return info;
});

const sanitizeFormat = format(info => sanitizeData(info));

// Base format
const baseFormat = combine(
  errorFormat(),
  sanitizeFormat(),
  addContextFormat(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true })
);

// Console format
const consoleFormat = combine(
  baseFormat,
  USE_JSON_FORMAT
    ? format.json()
    : format.printf(({ timestamp, level, message, context, error, ...rest }) => {
        const contextStr =
          context && Object.keys(context).length
            ? `[${Object.entries(context)
                .filter(([key]) => ['requestId', 'userId', 'traceId'].includes(key))
                .map(([key, val]) => `${key}=${val}`)
                .join(', ')}]`
            : '';

        const restStr = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '';
        const errorStr = error ? `\n${typeof error === 'object' ? JSON.stringify(error, null, 2) : error}` : '';

        return `${timestamp} [${level}]${contextStr}: ${message}${errorStr}${restStr}`;
      })
);

// File format
const fileFormat = combine(baseFormat, format.json());

// Winston transports
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: LOG_LEVEL,
});

const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  level: LOG_LEVEL,
});

const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
  level: LogLevel.ERROR,
});

// Create logger
const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  defaultMeta: {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [consoleTransport, fileTransport, errorFileTransport],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
});

// Morgan stream
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Context utils
export const setLogLevel = (level: LogLevel) => {
  logger.transports.forEach((t) => (t.level = level));
};

export const withContext = <T>(data: Record<string, any>, callback: () => T): T => {
  const store = new Map(Object.entries(data));
  return asyncLocalStorage.run(store, callback);
};

export const addToContext = (key: string, value: any): void => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set(key, value);
  }
};

export const getFromContext = <T>(key: string): T | undefined => {
  const store = asyncLocalStorage.getStore();
  return store?.get(key) as T | undefined;
};

export const createChildLogger = (context: Record<string, any>) =>
  logger.child(context);

export default logger;
