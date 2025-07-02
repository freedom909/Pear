import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  OAuthError,
  createErrorResponse,
} from '../../../errors/httpError';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('应该创建具有默认值的基本错误', () => {
      const error = new AppError('测试错误');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('测试错误');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeUndefined();
    });

    it('应该创建具有自定义值的错误', () => {
      const details = { field: 'username', issue: 'required' };
      const error = new AppError(
        '验证错误',
        422,
        'VALIDATION_FAILED',
        true,
        details
      );

      expect(error.message).toBe('验证错误');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });

    it('应该捕获堆栈跟踪', () => {
      const error = new AppError('测试错误');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('Specific Error Classes', () => {
    it('BadRequestError 应该有正确的默认值', () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('请求无效');
    });

    it('UnauthorizedError 应该有正确的默认值', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('未授权访问');
    });

    it('ForbiddenError 应该有正确的默认值', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('禁止访问');
    });

    it('NotFoundError 应该有正确的默认值', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('资源未找到');
    });

    it('ConflictError 应该有正确的默认值', () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('资源冲突');
    });

    it('ValidationError 应该有正确的默认值', () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('数据验证失败');
    });

    it('InternalServerError 应该有正确的默认值', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('服务器内部错误');
      expect(error.isOperational).toBe(false);
    });

    it('ServiceUnavailableError 应该有正确的默认值', () => {
      const error = new ServiceUnavailableError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('服务不可用');
      expect(error.isOperational).toBe(false);
    });

    it('OAuthError 应该有正确的默认值', () => {
      const error = new OAuthError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('OAUTH_ERROR');
      expect(error.message).toBe('OAuth认证失败');
    });

    it('应该允许自定义错误消息和代码', () => {
      const error = new NotFoundError('用户不存在', 'USER_NOT_FOUND');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.message).toBe('用户不存在');
    });

    it('应该允许添加详细信息', () => {
      const details = { userId: '123', resource: 'profile' };
      const error = new ForbiddenError(
        '无权访问此用户资料',
        'ACCESS_DENIED',
        details
      );

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('ACCESS_DENIED');
      expect(error.message).toBe('无权访问此用户资料');
      expect(error.details).toEqual(details);
    });
  });

  describe('createErrorResponse', () => {
    it('应该为AppError创建标准响应', () => {
      const error = new ValidationError('字段验证失败', 'FIELD_VALIDATION', {
        field: 'email',
      });
      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        code: 'FIELD_VALIDATION',
        message: '字段验证失败',
        details: { field: 'email' },
      });
    });

    it('应该为普通Error创建标准响应', () => {
      const error = new Error('未知错误');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: '未知错误',
      });
    });

    it('应该在生产环境中隐藏普通Error的详细信息', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('敏感的错误信息');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误',
      });

      process.env.NODE_ENV = 'development';
    });

    it('应该处理没有消息的错误', () => {
      const error = new Error();
      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: '未知错误',
      });
    });
  });
});
