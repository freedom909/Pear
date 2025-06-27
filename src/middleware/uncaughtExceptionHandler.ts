import logger from './logger';

/**
 * 优雅关闭选项
 */
interface GracefulShutdownOptions {
  // 关闭超时时间（毫秒）
  timeout?: number;
  // 退出代码
  exitCode?: number;
  // 是否在关闭前记录堆栈跟踪
  logStackTrace?: boolean;
}

/**
 * 默认关闭选项
 */
const defaultOptions: GracefulShutdownOptions = {
  timeout: 5000,
  exitCode: 1,
  logStackTrace: true
};

/**
 * 处理未捕获的异常和拒绝的承诺
 * @param server Express服务器实例
 * @param options 关闭选项
 */
export function setupUncaughtExceptionHandling(
  server: any,
  options: GracefulShutdownOptions = {}
): void {
  const config = { ...defaultOptions, ...options };
  let shuttingDown = false;

  /**
   * 优雅关闭服务器
   */
  const gracefulShutdown = (error: Error | string, reason: string): void => {
    // 防止多次调用
    if (shuttingDown) return;
    shuttingDown = true;

    logger.error(`Initiating graceful shutdown: ${reason}`, {
      error: typeof error === 'string' ? error : {
        name: error.name,
        message: error.message,
        stack: config.logStackTrace ? error.stack : undefined
      }
    });

    // 设置超时强制退出
    const forceExit = setTimeout(() => {
      logger.error(`Graceful shutdown timed out after ${config.timeout}ms, forcing exit`);
      process.exit(config.exitCode);
    }, config.timeout);

    // 确保超时不会阻止进程退出
    forceExit.unref();

    // 尝试关闭服务器
    if (server && typeof server.close === 'function') {
      logger.info('Closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed successfully');
        
        // 关闭数据库连接
        closeDbConnections()
          .then(() => {
            logger.info('All connections closed successfully, exiting process');
            process.exit(config.exitCode);
          })
          .catch((err) => {
            logger.error('Error closing database connections', { error: err });
            process.exit(config.exitCode);
          });
      });
    } else {
      logger.warn('No HTTP server to close or server.close is not a function');
      
      // 关闭数据库连接
      closeDbConnections()
        .then(() => {
          logger.info('All connections closed successfully, exiting process');
          process.exit(config.exitCode);
        })
        .catch((err) => {
          logger.error('Error closing database connections', { error: err });
          process.exit(config.exitCode);
        });
    }
  };

  /**
   * 关闭数据库连接
   */
  const closeDbConnections = async (): Promise<void> => {
    try {
      // 这里可以添加关闭MongoDB、Redis等连接的代码
      // 例如: await mongoose.connection.close();
      logger.info('Database connections closed');
      return Promise.resolve();
    } catch (error) {
      logger.error('Error closing database connections', { error });
      return Promise.reject(error);
    }
  };

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    gracefulShutdown(error, 'Uncaught exception');
  });

  // 处理未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? {
        name: reason.name,
        message: reason.message,
        stack: reason.stack
      } : reason,
      promise
    });
    gracefulShutdown(
      reason instanceof Error ? reason : String(reason),
      'Unhandled promise rejection'
    );
  });

  // 处理SIGTERM信号（例如，从Docker或Kubernetes发送）
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received');
    gracefulShutdown('SIGTERM received', 'SIGTERM signal');
  });

  // 处理SIGINT信号（例如，按Ctrl+C）
  process.on('SIGINT', () => {
    logger.info('SIGINT signal received');
    gracefulShutdown('SIGINT received', 'SIGINT signal');
  });

  logger.info('Uncaught exception and rejection handlers set up');
}

export default setupUncaughtExceptionHandling;