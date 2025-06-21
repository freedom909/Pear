import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { notFoundHandler, errorHandler, asyncHandler } from '../../../middleware/errorHandler';
import { 
  AppError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError,
  ValidationError
} from '../../../utils/errors';

// 创建测试应用
const createTestApp = () => {
  const app = express();
  
  // 配置路由
  app.get('/api/error/:type', (req: Request, res: Response, next: NextFunction) => {
    const errorType = req.params.type;
    
    switch (errorType) {
      case 'bad-request':
        next(new BadRequestError('无效的请求参数'));
        break;
      case 'unauthorized':
        next(new UnauthorizedError('未授权访问'));
        break;
      case 'forbidden':
        next(new ForbiddenError('禁止访问此资源'));
        break;
      case 'not-found':
        next(new NotFoundError('资源未找到'));
        break;
      case 'validation':
        next(new ValidationError('数据验证失败', 'VALIDATION_ERROR', { field: 'username', message: '用户名不能为空' }));
        break;
      case 'mongoose-validation':
        const error: any = new Error('User validation failed: username: Path `username` is required.');
        error.name = 'ValidationError';
        next(error);
        break;
      case 'duplicate-key':
        const dupError: any = new Error('Duplicate key error');
        dupError.code = 11000;
        dupError.keyValue = { email: 'test@example.com' };
        next(dupError);
        break;
      case 'jwt-invalid':
        const jwtError: any = new Error('invalid token');
        jwtError.name = 'JsonWebTokenError';
        next(jwtError);
        break;
      case 'jwt-expired':
        const expiredError: any = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        next(expiredError);
        break;
      case 'standard':
        next(new Error('标准错误'));
        break;
      default:
        res.status(200).json({ message: '没有错误' });
    }
  });
  
  // 异步错误处理测试
  app.get('/api/async-error', asyncHandler(async (req: Request, res: Response) => {
    throw new NotFoundError('异步操作中的资源未找到');
  }));
  
  // 添加错误处理中间件
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

describe('Error Handler Integration Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createTestApp();
    process.env.NODE_ENV = 'development';
  });
  
  it('应该正确处理BadRequestError', async () => {
    const response = await request(app).get('/api/error/bad-request');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'BAD_REQUEST',
      message: '无效的请求参数'
    }));
  });
  
  it('应该正确处理UnauthorizedError', async () => {
    const response = await request(app).get('/api/error/unauthorized');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: '未授权访问'
    }));
  });
  
  it('应该正确处理ForbiddenError', async () => {
    const response = await request(app).get('/api/error/forbidden');
    
    expect(response.status).toBe(403);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'FORBIDDEN',
      message: '禁止访问此资源'
    }));
  });
  
  it('应该正确处理NotFoundError', async () => {
    const response = await request(app).get('/api/error/not-found');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'NOT_FOUND',
      message: '资源未找到'
    }));
  });
  
  it('应该正确处理ValidationError', async () => {
    const response = await request(app).get('/api/error/validation');
    
    expect(response.status).toBe(422);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '数据验证失败',
      details: { field: 'username', message: '用户名不能为空' }
    }));
  });
  
  it('应该正确处理Mongoose验证错误', async () => {
    const response = await request(app).get('/api/error/mongoose-validation');
    
    expect(response.status).toBe(422);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '数据验证失败'
    }));
  });
  
  it('应该正确处理MongoDB重复键错误', async () => {
    const response = await request(app).get('/api/error/duplicate-key');
    
    expect(response.status).toBe(409);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'DUPLICATE_KEY',
      message: '资源已存在',
      details: { email: 'test@example.com' }
    }));
  });
  
  it('应该正确处理JWT无效错误', async () => {
    const response = await request(app).get('/api/error/jwt-invalid');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: '无效的认证令牌'
    }));
  });
  
  it('应该正确处理JWT过期错误', async () => {
    const response = await request(app).get('/api/error/jwt-expired');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: '认证令牌已过期'
    }));
  });
  
  it('应该正确处理标准错误', async () => {
    const response = await request(app).get('/api/error/standard');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: '标准错误'
    }));
    
    // 在开发环境中应该包含堆栈跟踪
    expect(response.body).toHaveProperty('stack');
  });
  
  it('应该在生产环境中隐藏堆栈跟踪', async () => {
    process.env.NODE_ENV = 'production';
    
    const response = await request(app).get('/api/error/standard');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误' // 在生产环境中使用通用消息
    }));
    
    // 在生产环境中不应该包含堆栈跟踪
    expect(response.body).not.toHaveProperty('stack');
  });
  
  it('应该处理不存在的路由', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'NOT_FOUND',
      message: expect.stringContaining('/non-existent-route')
    }));
  });
  
  it('应该处理异步错误', async () => {
    const response = await request(app).get('/api/async-error');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'error',
      code: 'NOT_FOUND',
      message: '异步操作中的资源未找到'
    }));
  });
});