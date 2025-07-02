import { Request, Response, NextFunction } from 'express';
import {
  notFoundHandler,
  errorHandler,
} from '../../../middleware/errorHandler';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
} from '../../../utils/errors';

// 模拟请求、响应和下一个中间件
const mockRequest = () => {
  return {
    originalUrl: '/test-url',
  } as unknown as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Error Handler Middleware', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  describe('notFoundHandler', () => {
    it('应该创建404错误并传递给next', () => {
      notFoundHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND',
          message: expect.stringContaining('/test-url'),
        })
      );
    });
  });

  describe('errorHandler', () => {
    it('应该处理AppError实例', () => {
      const error = new AppError('测试错误', 400, 'TEST_ERROR');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'TEST_ERROR',
          message: '测试错误',
        })
      );
    });

    it('应该处理ValidationError', () => {
      const error = new ValidationError('验证错误', 'VALIDATION_ERROR', {
        field: 'username',
      });

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: '验证错误',
          details: { field: 'username' },
        })
      );
    });

    it('应该处理Mongoose验证错误', () => {
      const error = {
        name: 'ValidationError',
        message: 'User validation failed',
      };

      errorHandler(error as Error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: '数据验证失败',
        })
      );
    });

    it('应该处理MongoDB重复键错误', () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandler(error as any, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'DUPLICATE_KEY',
          message: '资源已存在',
        })
      );
    });

    it('应该处理JWT错误', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'invalid token',
      };

      errorHandler(error as Error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌',
        })
      );
    });

    it('应该处理JWT过期错误', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      errorHandler(error as Error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'TOKEN_EXPIRED',
          message: '认证令牌已过期',
        })
      );
    });

    it('应该在开发环境中包含堆栈跟踪', () => {
      const error = new Error('测试错误');
      error.stack = 'Error: 测试错误\n    at Test.js:1:1';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.stringContaining('Error: 测试错误'),
        })
      );
    });

    it('应该在生产环境中隐藏堆栈跟踪', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('测试错误');
      error.stack = 'Error: 测试错误\n    at Test.js:1:1';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('应该在生产环境中使用通用错误消息', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('敏感的错误信息');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '服务器内部错误',
        })
      );
    });
  });
});
