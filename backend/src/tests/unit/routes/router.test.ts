import request from 'supertest';
import express from 'express';
import { describe, it, expect } from '@jest/globals';

// 创建一个简单的 Express 应用用于测试
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // 测试路由
  app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Test route working' });
  });
  
  // 带参数的测试路由
  app.get('/api/test/:id', (req, res) => {
    res.status(200).json({ id: req.params.id });
  });
  
  // 错误处理路由
  app.get('/api/error', (req, res, next) => {
    next(new Error('Test error'));
  });
  
  // 错误处理中间件
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message });
  });
  
  return app;
};

describe('Router Tests', () => {
  const app = createTestApp();
  
  it('should respond to basic route', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body).toEqual({ message: 'Test route working' });
  });
  
  it('should handle route parameters', async () => {
    const testId = '123';
    const response = await request(app)
      .get(`/api/test/${testId}`)
      .expect(200);
    
    expect(response.body).toEqual({ id: testId });
  });
  
  it('should handle errors', async () => {
    const response = await request(app)
      .get('/api/error')
      .expect(500);
    
    expect(response.body).toEqual({ error: 'Test error' });
  });
});