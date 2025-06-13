import winston from 'winston';
import { config } from './app.config';

/**
 * Logger configuration
 */
export class LoggerConfig {
  private static logger: winston.Logger;

  /**
   * Initialize logger
   */
  private static initialize(): void {
    if (this.logger) {
      return;
    }

    const { combine, timestamp, printf, colorize } = winston.format;

    // Custom log format
    const logFormat = printf(({ level, message, timestamp, ...meta }) => {
      let logMessage = `${timestamp} [${level}]: ${message}`;
      
      // Add metadata if available
      if (Object.keys(meta).length > 0) {
        const metaString = JSON.stringify(meta, null, 2);
        logMessage += ` - ${metaString}`;
      }
      
      return logMessage;
    });

    // Create logger instance
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: combine(
        timestamp(),
        logFormat
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp(),
            logFormat
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
  public static debug(message: string, meta: object = {}): void {
    this.getLogger().debug(message, meta);
  }
}