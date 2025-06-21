import { Request, Response, NextFunction } from 'express';
import { isAuthenticated, hasRole, isAdmin, isResourceOwner, optionalAuth } from '../../../middleware/auth';

// 模拟请求、响应和下一个中间件
const mockRequest = (isAuth = false, user = {}) => {
  return {
    isAuthenticated: jest.fn().mockReturnValue(isAuth),
    user
  } as unknown as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('应该在用户已认证时调用next', () => {
      const req = mockRequest(true);
      const res = mockResponse();
      
      isAuthenticated(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户未认证时返回401错误', () => {
      const req = mockRequest(false);
      const res = mockResponse();
      
      isAuthenticated(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        code: 'UNAUTHORIZED'
      }));
    });
  });

  describe('hasRole', () => {
    it('应该在用户拥有所需角色时调用next', () => {
      const req = mockRequest(true, { role: 'admin' });
      const res = mockResponse();
      const middleware = hasRole(['admin', 'editor']);
      
      middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户未认证时返回401错误', () => {
      const req = mockRequest(false);
      const res = mockResponse();
      const middleware = hasRole(['admin']);
      
      middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('应该在用户没有所需角色时返回403错误', () => {
      const req = mockRequest(true, { role: 'user' });
      const res = mockResponse();
      const middleware = hasRole(['admin', 'editor']);
      
      middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isAdmin', () => {
    it('应该在用户是管理员时调用next', () => {
      const req = mockRequest(true, { role: 'admin' });
      const res = mockResponse();
      
      isAdmin(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户未认证时返回401错误', () => {
      const req = mockRequest(false);
      const res = mockResponse();
      
      isAdmin(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('应该在用户不是管理员时返回403错误', () => {
      const req = mockRequest(true, { role: 'user' });
      const res = mockResponse();
      
      isAdmin(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isResourceOwner', () => {
    it('应该在用户是资源所有者时调用next', async () => {
      const userId = '123';
      const req = mockRequest(true, { id: userId });
      const res = mockResponse();
      const getResourceUserId = jest.fn().mockResolvedValue(userId);
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).toHaveBeenCalledWith(req);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户是管理员时调用next', async () => {
      const req = mockRequest(true, { id: '456', role: 'admin' });
      const res = mockResponse();
      const getResourceUserId = jest.fn().mockResolvedValue('123');
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).toHaveBeenCalledWith(req);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户未认证时返回401错误', async () => {
      const req = mockRequest(false);
      const res = mockResponse();
      const getResourceUserId = jest.fn();
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('应该在资源不存在时返回404错误', async () => {
      const req = mockRequest(true, { id: '123' });
      const res = mockResponse();
      const getResourceUserId = jest.fn().mockResolvedValue(undefined);
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).toHaveBeenCalledWith(req);
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('应该在用户不是资源所有者且不是管理员时返回403错误', async () => {
      const req = mockRequest(true, { id: '456', role: 'user' });
      const res = mockResponse();
      const getResourceUserId = jest.fn().mockResolvedValue('123');
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).toHaveBeenCalledWith(req);
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('应该在获取资源ID时出错时调用next并传递错误', async () => {
      const req = mockRequest(true, { id: '123' });
      const res = mockResponse();
      const error = new Error('Database error');
      const getResourceUserId = jest.fn().mockRejectedValue(error);
      const middleware = isResourceOwner(getResourceUserId);
      
      await middleware(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(getResourceUserId).toHaveBeenCalledWith(req);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('应该在用户已认证时调用next', () => {
      const req = mockRequest(true);
      const res = mockResponse();
      
      optionalAuth(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该在用户未认证时也调用next', () => {
      const req = mockRequest(false);
      const res = mockResponse();
      
      optionalAuth(req, res, mockNext);
      
      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});