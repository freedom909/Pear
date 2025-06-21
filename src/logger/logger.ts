import winston from 'winston';
import  config from '../config/config';
import fs from 'fs';
import path from 'path';
/**
 * Logger configuration
 */
export class Log {
  private static logger: winston.Logger;

  /**
   * Initialize logger
   */
  private static initialize(): void {
    if (this.logger) {
      return;
    }
    const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

    const { combine, timestamp,  colorize } = winston.format;

    // Custom log format
    // const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    //   let logMessage = `${timestamp} [${level}]: ${message}`;
      
    //   // Add metadata if available
    //   if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
    //     logMessage += ` - ${JSON.stringify(meta, null, 2)}`;
    //   }
      
      
    //   return logMessage;
    // });

    
    // Create logger instance
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: combine(
        timestamp(),
        buildLogFormat()
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp(),
            buildLogFormat()
          )
        })
      ]
    });

    // Add file transports in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        })
      );
      
      this.logger.add(
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        })
      );
    }
  }

  buildLogFormat: () => winston.Logform.Format = () => {
    const { timestamp, printf } = winston.format;
    return printf(({ level, message, _timestamp, ...meta }) => {
      let logMessage = `${_timestamp} [${level}]: ${message}`;
      if (meta && Object.keys(meta).length > 0) {
        logMessage += ` - ${JSON.stringify(meta, null, 2)}`;
      }
      return logMessage;
    });
  };
  

  /**
   * Get logger instance
   */
  private static getLogger(): winston.Logger {
    if (!this.logger) {
      this.initialize();
    }
    return this.logger;
  }

  /**
   * Log info message
   */
  public static info(message: string, meta: object = {}): void {
    this.getLogger().info(message, meta);
  }

  /**
   * Log warning message
   */
  public static warn(message: string, meta: object = {}): void {
    this.getLogger().warn(message, meta);
  }

  /**
   * Log error message
   */
  public static error(message: string, meta: object = {}): void {
    this.getLogger().error(message, meta);
  }

  /**
   * Log debug message
   */
  public static debug(message: string, meta?: unknown | Record<string, unknown>
  ): void {
    this.getLogger().debug(message, meta);
  }
}

function buildLogFormat(): winston.Logform.Format {
    throw new Error('Function not implemented.');
}
const logger = new Log();
export default logger;