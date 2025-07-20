import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import notFoundHandler from '../../../middleware/notFoundHandler';
import { asyncHandler } from '../../../middleware/asyncHandler';
import errorHandler from '../../../middleware/errorHandler';
import { AppError } from '../../../errors/appError';
import assert from 'node:assert/strict';
import { describe, beforeEach, it } from 'node:test';

// 创建测试应用
const createTestApp = () => {
  const app = express();

  // 配置路由
  app.get(
    '/api/error/:type',
    (req: Request, res: Response, next: NextFunction) => {
      const errorType = req.params.type;

      switch (errorType) {
        case 'bad-request':
          next(AppError.badRequest('无效的请求参数'));
          break;
        case 'unauthorized':
          next(AppError.unauthorized('未授权访问'));
          break;
        case 'forbidden':
          next(AppError.forbidden('禁止访问此资源'));
          break;
        case 'not-found':
          next(AppError.notFound('资源未找到'));
          break;
        case 'validation':
          next(
            AppError.validation('请求参数验证失败', {
              message: '请求参数验证失败',
              errors: [
                {
                  field: 'username',
                  message: '用户名不能为空',
                },
              ],
            })
          );
          break; // ADD missing break
        case 'too-many-requests':
          next(AppError.tooManyRequests('请求过于频繁，请稍后再试'));
          break;
        case 'internal':
        case 'mongoose-validation':
          const error: any = new Error(
            'User validation failed: username: Path `username` is required.'
          );
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
    }
  );

  app.get(
    '/api/async-error',
    asyncHandler(async (_req: Request, _res: Response) => {
      throw AppError.notFound('异步操作中的资源未找到');
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Error Handler Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    process.env.NODE_ENV === 'development';
  });

  it('应该正确处理BadRequestError', async () => {
    const response = await request(app).get('/api/error/bad-request');
    assert.strictEqual(response.status, 400);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'BAD_REQUEST',
      message: '无效的请求参数',
    });
  });

  it('应该正确处理TooManyRequestsError', async () => {
    const response = await request(app).get('/api/error/too-many-requests');
    assert.strictEqual(response.status, 429);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'TOO_MANY_REQUESTS',
      message: '请求过于频繁，请稍后再试',
    });
  });

  it('应该正确处理InternalServerError', async () => {
    const response = await request(app).get('/api/error/internal');
    assert.strictEqual(response.status, 500);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误',
    });
  });

  it('应该正确处理JWT无效错误', async () => {
    const response = await request(app).get('/api/error/jwt-invalid');
    assert.strictEqual(response.status, 401);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'INVALID_TOKEN',
      message: '无效的令牌',
    });
  });

  it('应该正确处理JWT过期错误', async () => {
    const response = await request(app).get('/api/error/jwt-expired');
    assert.strictEqual(response.status, 401);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: '令牌已过期',
    });
  });

  it('应该正确处理标准错误', async () => {
    const response = await request(app).get('/api/error/standard');
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(response.body.message, '服务器内部错误');
    assert.ok(response.body.stack);
  });

  it('应该正确处理异步错误', async () => {
    const response = await request(app).get('/api/async-error');
    assert.strictEqual(response.status, 404);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'NOT_FOUND',
      message: '异步操作中的资源未找到',
    });
  });

  it('应该正确处理未处理的错误', async () => {
    const response = await request(app).get('/api/error/unhandled');
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'INTERNAL_SERVER_ERROR');
  });

  it('应该正确处理UnauthorizedError', async () => {
    const response = await request(app).get('/api/error/unauthorized');
    assert.strictEqual(response.status, 401);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'UNAUTHORIZED',
      message: '未授权访问',
    });
  });

  it('应该正确处理ForbiddenError', async () => {
    const response = await request(app).get('/api/error/forbidden');
    assert.strictEqual(response.status, 403);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'FORBIDDEN',
      message: '禁止访问此资源',
    });
  });

  it('应该正确处理NotFoundError', async () => {
    const response = await request(app).get('/api/error/not-found');
    assert.strictEqual(response.status, 404);
    assert.deepEqual(response.body, {
      status: 'error',
      code: 'NOT_FOUND',
      message: '资源未找到',
    });
  });

  it('应该正确处理ValidationError', async () => {
    const response = await request(app).get('/api/error/validation');
    assert.strictEqual(response.status, 422);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'VALIDATION_ERROR');
    assert.strictEqual(response.body.message, '数据验证失败');
  });

  it('应该正确处理Mongoose验证错误', async () => {
    const response = await request(app).get('/api/error/mongoose-validation');
    assert.strictEqual(response.status, 422);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'VALIDATION_ERROR');
  });

  it('应该正确处理MongoDB重复键错误', async () => {
    const response = await request(app).get('/api/error/duplicate-key');
    assert.strictEqual(response.status, 409);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'DUPLICATE_KEY');
  });

  it('应该处理不存在的路由', async () => {
    const response = await request(app).get('/non-existent-route');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.status, 'error');
    assert.strictEqual(response.body.code, 'NOT_FOUND');
  });
});
