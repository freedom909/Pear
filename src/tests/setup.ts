
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB, clearDB } from '../utils/db';
import config from '../config/config';

// 使用内存MongoDB服务器进行测试
let mongoServer: MongoMemoryServer;

// 在所有测试之前设置测试环境
beforeAll(async () => {
  // 确保我们在测试环境中
  process.env.NODE_ENV = 'test';
  
  // 创建内存MongoDB服务器
mongoServer = new MongoMemoryServer();
await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  
  // 覆盖配置中的MongoDB URI
  config.mongo.uri = mongoUri as any;
  
  // 连接到测试数据库
  await connectDB();
});

// 每个测试之前清理数据库
beforeEach(async () => {
  await clearDB();
});

// 所有测试完成后清理
afterAll(async () => {
  // 断开数据库连接
  await disconnectDB();
  
  // 停止内存MongoDB服务器
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// 设置测试超时
jest.setTimeout(30000);