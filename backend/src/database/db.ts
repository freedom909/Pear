import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../middleware/logger';

/**
 * 连接数据库
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);

    logger.info(`MongoDB已连接: ${conn.connection.host}`);

    // 监听连接事件
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB连接已建立');
    });

    // 监听错误事件
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB连接错误: ${err}`);
    });

    // 监听断开连接事件
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接已断开');
    });

    // 监听进程终止事件，关闭数据库连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB连接已关闭（应用程序终止）');
      process.exit(0);
    });
  } catch (error) {
    logger.error(`MongoDB连接失败: ${error}`);
    process.exit(1);
  }
};

/**
 * 断开数据库连接
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB连接已关闭');
  } catch (error) {
    logger.error(`MongoDB断开连接失败: ${error}`);
    process.exit(1);
  }
};
export const clearDB = async (): Promise<void> => {
  try {
    await mongoose.connection.dropDatabase();
    logger.info('MongoDB数据库已清空');
  } catch (error) {
    logger.error(`清空MongoDB数据库失败: ${error}`);
  }
};
