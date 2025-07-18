import { login, logout } from '../../../controllers/auth.controller';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../errors/appError';
import { signToken } from '../../../utils/jwt';
import User from '../../../models/user/user.model';
import { jest,describe,it,expect,beforeEach } from '@jest/globals';

jest.mock('../../../models/user/user.model');
jest.mock('../../../utils/jwt');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const testUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    comparePassword: jest.fn()
  };

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as any,
      json: jest.fn() as unknown as any
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValueOnce(testUser as never);
      testUser.comparePassword.mockResolvedValueOnce(true as never);
      (signToken as jest.Mock).mockReturnValueOnce('testToken');

      await login(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(testUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(signToken).toHaveBeenCalledWith({ id: 'user123', email: 'test@example.com' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'testToken',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    });

    it('should throw error for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };
      
      (User.findOne as jest.Mock).mockResolvedValueOnce(testUser as never);
      testUser.comparePassword.mockResolvedValueOnce(false as never);

      await login(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid credentials'
        })
      );
    });

    it('should throw error for non-existent user', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValueOnce(null as unknown as never);

      await login(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid credentials'
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await logout(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully'
      });
    });
  });
});