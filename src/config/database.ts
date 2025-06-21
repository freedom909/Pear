import mongoose from 'mongoose';
import { ErrorResponse } from '../utils/errorResponse';
import logger  from '../utils/logger';

/**
 * 连接MongoDB数据库
 */
export const connectDB = async () => {
  try {
    // 检查MongoDB连接URI是否配置
    if (!process.env.MONGO_URI) {
      throw new ErrorResponse('MONGO_URI未配置', 500);
    }

    // 设置Mongoose选项
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // 在生产环境中禁用自动索引
      maxPoolSize: 10, // 连接池大小
      serverSelectionTimeoutMS: 5000, // 服务器选择超时时间
      socketTimeoutMS: 45000, // 套接字超时时间
      family: 4, // 使用IPv4
    };

    // 建立连接
    await mongoose.connect(process.env.MONGO_URI, options);

    logger.info('MongoDB连接成功');

    // 监听连接事件
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose已连接到MongoDB');
    });

    // 监听错误事件
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB连接错误: ${err.message}`);
    });

    // 监听断开连接事件
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接断开');
    });

    // 监听进程终止事件
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB连接因应用终止而关闭');
      process.exit(0);
    });
  } catch (err) {
    logger.error(`MongoDB连接失败: ${(err as Error).message}`);
    process.exit(1);
  }
};

/**
 * 关闭MongoDB连接
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB连接已关闭');
  } catch (err) {
    logger.error(`关闭MongoDB连接失败: ${(err as Error).message}`);
    throw new ErrorResponse('关闭数据库连接失败', 500);
  }
};

/**
 * 删除所有集合（仅用于测试环境）
 */
export const clearDB = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new ErrorResponse('清除数据库只能在测试环境中进行', 403);
  }

  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    logger.info('测试数据库已清除');
  } catch (err) {
    logger.error(`清除测试数据库失败: ${(err as Error).message}`);
    throw new ErrorResponse('清除数据库失败', 500);
  }
};