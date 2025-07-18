import { LocalAuthStrategy as LocalStrategy } from '../../../strategies/local';
import userService from '../../../services/user.service';
import { AppError } from '../../../errors/appError';
import ErrorCode from '../../../errors/error-code';
import { UserDocument } from '../../../models/user/user.types';
import { Request } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
/// <reference types="jest" />
/// <reference types="jest" />
jest.mock('../../../services/user.service');
const mockedUserService = userService as jest.Mocked<typeof userService>;

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let mockDone: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of LocalStrategy
    localStrategy = new LocalStrategy();
    
    // Mock the done callback
    mockDone = jest.fn();
  });
  
  describe('validate', () => {
    it('should return user if email and password are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        _id: 'user123',
        email,
      comparePassword: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)


      } as unknown as UserDocument; // Argument of type 'true' is not assignable to parameter of type 'never'.
      
      mockedUserService.findUserByEmail.mockResolvedValue(mockUser);
      
      // Act
      await localStrategy['validate'](email, password, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });
    
    it('should return error if user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      mockedUserService.findUserByEmail.mockResolvedValue(null as unknown as UserDocument);
      
      // Act
      await localStrategy['validate'](email, password, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '用户不存在',
          code: ErrorCode.NOT_FOUND,
        }),
        false
      );
    });
    
    it('should return error if password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        _id: 'user123',
        email,
        comparePassword: jest.fn<() => Promise<boolean>>().mockResolvedValue(false)

      } as unknown as UserDocument;
      
      mockedUserService.findUserByEmail.mockResolvedValue(mockUser);
      
      // Act
      await localStrategy['validate'](email, password, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '密码错误',
          code: ErrorCode.UNAUTHORIZED,
        }),
        false
      );
    });
    
    it('should handle unexpected errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Database connection failed');
      
      mockedUserService.findUserByEmail.mockRejectedValue(error);
      
      // Act
      await localStrategy['validate'](email, password, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '登录失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: error,
        }),
        false
      );
    });
  });
  
  describe('authenticate', () => {
    it('should call passport authenticate with correct options', () => {
      // Arrange
      const mockReq = {} as Request;
      const mockRes = {};
      const mockNext = jest.fn();
      const mockPassport = {
        authenticate: jest.fn().mockReturnValue(jest.fn()),
      };
      
      // Mock the passport instance
      (localStrategy as any).passport = mockPassport;
      
      // Act
        (localStrategy as any).authenticate(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockPassport.authenticate).toHaveBeenCalledWith('local', {
        session: false,
      }, expect.any(Function));
    });
  });
});