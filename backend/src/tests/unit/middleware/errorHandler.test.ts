import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middleware/errorHandler';
import notFoundHandler from '../../../middleware/notFoundHandler';
import { AppError } from '../../../errors/appError';
import ErrorCode from '../../../errors/error-code';
import { UnauthorizedError as HttpUnauthorizedError, ValidationError as HttpValidationError } from '../../../errors/httpError';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Utility functions to create mock Express req/res/next
const mockRequest = (): Request => ({ originalUrl: '/test-url' } as Request);

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  (res as any).status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res) as Response['json'];
  return res as Response;
};
const mockNext = jest.fn() as unknown as NextFunction as jest.MockedFunction<NextFunction>;


describe('Middleware: Error Handlers', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
    process.env.NODE_ENV ==='development';
  });

  describe('notFoundHandler', () => {
    it('should forward a 404 AppError when route not found', () => {
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
    it('should handle AppError correctly', () => {
      const error = new AppError({
        message: 'Test Error',
        code: ErrorCode.TEST_ERROR,
        details: 'TEST_ERROR'
      });

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: ErrorCode.TEST_ERROR,
          message: 'Test Error',
        })
      );
    });

    it('should handle ValidationError (Mongoose)', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      (error as any).path = 'email';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: ErrorCode.VALIDATION_ERROR,
          message: '数据验证失败',
          details: {
            field: 'email',
            message: 'Validation failed'
          }
        })
      );
    });

    it('should handle ValidationError (Custom)', () => {
      const error = new HttpValidationError('验证错误', 'VALIDATION_ERROR');
      error.details = { field: 'username' };

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

    it('should handle UnauthorizedError', () => {
      const error = new HttpUnauthorizedError('未授权访问', 'UNAUTHORIZED');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: '未授权访问',
        })
      );
    });

    it('should handle duplicate Mongo key errors', () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(error as any, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: ErrorCode.DUPLICATE_ENTRY,
          message: '资源已存在',
          details: { email: 'test@example.com' },
        })
      );
    });

    it('should handle JWT errors', () => {
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

    it('should handle JWT expiration errors', () => {
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

    it('should handle unknown errors in development (show stack)', () => {
      const error = new Error('Unexpected failure');
      error.stack = 'Error: Unexpected failure\n    at Test.js:1:1';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Unexpected failure',
          stack: expect.any(String),
        })
      );
    });

    it('should hide stack and message in production', () => {
      process.env.NODE_ENV == 'production';
      const error = new Error('Sensitive internal error');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '服务器内部错误',
        })
      );
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });
  });
});
