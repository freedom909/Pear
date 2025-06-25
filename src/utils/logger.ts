import winston from 'winston';
// import path from 'path';
// import { format } from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// const { combine, timestamp, printf, colorize, align } = format;

// // 自定义日志格式
// const logFormat = printf(({ level, message, timestamp }) => {
//   return `${timestamp} [${level}]: ${message}`;
// });

// // 控制台传输配置
// const consoleTransport = new winston.transports.Console({
//   format: combine(
//     colorize(),
//     timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     align(),
//     logFormat
//   ),
//   level: 'debug'
// });

// // 文件传输配置
// const fileTransport: DailyRotateFile = new DailyRotateFile({
//   filename: path.join('logs', 'application-%DATE%.log'),
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '14d',
//   format: combine(timestamp(), logFormat),
//   level: 'info'
// });

// // 错误文件传输配置
// const errorFileTransport: DailyRotateFile = new DailyRotateFile({
//   filename: path.join('logs', 'error-%DATE%.log'),
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '30d',
//   format: combine(timestamp(), logFormat),
//   level: 'error'
// });

// // 创建日志记录器
// const logger = winston.createLogger({
//   levels: winston.config.npm.levels,
//   transports: [consoleTransport, fileTransport, errorFileTransport,  new winston.transports.Console(), // <-- log to terminal
//     new winston.transports.File({ filename: 'logs/app.log' })],
//   exceptionHandlers: [
//     new winston.transports.File({ filename: 'logs/exceptions.log' })
//   ],
//   rejectionHandlers: [
//     new winston.transports.File({ filename: 'logs/rejections.log' })
//   ],
//   exitOnError: false
// });

// // 日志流用于morgan
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// // 日志级别枚举
// export const LogLevel= {
//   ERROR: 'error',
//   WARN: 'warn',
//   INFO: 'info',
//   HTTP: 'http',
//   VERBOSE: 'verbose',
//   DEBUG: 'debug',
//   SILLY: 'silly'
// }

// /**
//  * 设置日志级别
//  * @param level 日志级别
//  */
// export const setLogLevel = (level: typeof LogLevel) => {
//   logger.transports.forEach((transport) => {
// const validLevel = level as unknown as keyof typeof winston.config.npm.levels;
// transport.level = validLevel.toString();
//   });
// };

// export default logger;
// utils/logger.ts


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // <-- log to terminal
    new winston.transports.File({ filename: 'logs/app.log' }) // <-- optional file log
  ],
});

export default logger;
