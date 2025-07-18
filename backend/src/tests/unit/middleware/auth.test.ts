import { Response, NextFunction } from 'express';
import {
  protect,
  isAuthenticated,
  authorize,
  restrictTo,
  AuthRequest
} from '../../../middleware/auth';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { ErrorCode } from '../../../errors/error-code';
import { UserRole, UserDocument } from '../../../models/user/user.types';

// Mock user service
jest.mock('../../../services/user.service', () => ({
  getUserById: jest.fn()
}));

// Import the mocked service
import userService from '../../../services/user.service';

const jwtSecret = 'secure-random-string-here';

// 模拟请求、响应和下一个中间件
const mockRequest = (user?: Partial<UserDocument>, headers?: Record<string, string>, cookies?: Record<string, string>): AuthRequest => {
  return {
    user: user as UserDocument,
    headers: headers || {},
    cookies: cookies || {},
  } as unknown as AuthRequest;
};

const mockResponse = (): Response => {
  const res = {} as Partial<Response>;
  res.send = jest.fn().mockReturnValue(res) as any;
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should call next() when user is authenticated', () => {
      const req = mockRequest({ id: '123' });
      const res = mockResponse();

      isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 error when user is not authenticated', () => {
      const req = mockRequest();
      const res = mockResponse();

      isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authenticated',
          code: ErrorCode.UNAUTHORIZED
        })
      );
    });
  });

  describe('protect', () => {
    it('should set req.user and call next() with valid JWT token', async () => {
      const userId = '123';
      const token = jwt.sign({ id: userId }, jwtSecret);
      const req = mockRequest(undefined, { authorization: `Bearer ${token}` });
      const res = mockResponse();
      
      // Mock user service
      const mockUser = { 
        id: userId,
        role: UserRole.USER
      } as UserDocument;
      
      jest.mocked(userService.getUserById).mockResolvedValue(mockUser);

      await protect(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe(userId);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 error when token is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await protect(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing token',
          code: ErrorCode.UNAUTHORIZED
        })
      );
    });

    it('should return 401 error with invalid token format', async () => {
      const req = mockRequest(undefined, { authorization: 'InvalidFormat' });
      const res = mockResponse();

      await protect(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return 401 error with expired token', async () => {
      const expiredToken = jwt.sign({ id: '123' }, jwtSecret, { expiresIn: '-1h' });
      const req = mockRequest(undefined, { authorization: `Bearer ${expiredToken}` });
      const res = mockResponse();

      await protect(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('authorize', () => {
    it('should call next() when user has required role', () => {
      const req = mockRequest({ id: '123', role: UserRole.ADMIN });
      const res = mockResponse();
      const middleware = authorize(UserRole.ADMIN);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 error when user lacks required role', () => {
      const req = mockRequest({ id: '123', role: UserRole.USER });
      const res = mockResponse();
      const middleware = authorize(UserRole.ADMIN);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied'),
          code: ErrorCode.FORBIDDEN
        })
      );
    });

    it('should return 401 error when user is not authenticated', () => {
      const req = mockRequest();
      const res = mockResponse();
      const middleware = authorize(UserRole.ADMIN);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authenticated',
          code: ErrorCode.UNAUTHORIZED
        })
      );
    });
  });

  describe('restrictTo', () => {
    it('should call next() when user has one of allowed roles', () => {
      const req = mockRequest({ id: '123', role: UserRole.MODERATOR });
      const res = mockResponse();
      const middleware = restrictTo(UserRole.ADMIN, UserRole.MODERATOR);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 error when user has none of allowed roles', () => {
      const req = mockRequest({ id: '123', role: UserRole.USER });
      const res = mockResponse();
      const middleware = restrictTo(UserRole.ADMIN, UserRole.MODERATOR);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied'),
          code: ErrorCode.FORBIDDEN
        })
      );
    });

    it('should return 401 error when user is not authenticated', () => {
      const req = mockRequest();
      const res = mockResponse();
      const middleware = restrictTo(UserRole.ADMIN, UserRole.MODERATOR);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authenticated',
          code: ErrorCode.UNAUTHORIZED
        })
      );
    });
  });
});