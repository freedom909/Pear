import { BaseStrategy } from '../../../strategies/base';
import { AppError } from '../../../errors/appError';
import ErrorCode from '../../../errors/error-code';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
/// <reference types="jest" />
/// <reference types="jest" />
jest.mock('passport');
// Remove the duplicate declaration, as 'mockedPassport' is redeclared later in the file
// Create a concrete implementation of BaseStrategy for testing
class TestStrategy extends BaseStrategy {
  [x: string]: any;
  passport: any;
  init(): void {
    // Empty implementation for testing purposes
  }
  constructor() {
    super();
  }
  
  authenticate(req: Request, res: Response, next: NextFunction): void {
    this.passport.authenticate('test-strategy', { session: false }, this.handleResponse(req, res, next))(req, res, next);
  }
}

// Mock passport
jest.mock('passport');
const mockedPassport = passport as jest.Mocked<typeof passport>;

describe('BaseStrategy', () => {
  let testStrategy: TestStrategy;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of TestStrategy
    testStrategy = new TestStrategy();
    
    // Mock request, response, and next
    mockReq = {
      logIn: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn() as jest.MockedFunction<Response['json']>,
    };
    mockNext = jest.fn();
  });
  
  describe('handleResponse', () => {
    it('should call next with error if error is provided', () => {
      // Arrange
      const error = new AppError({
        message: 'Authentication failed',
        code: ErrorCode.UNAUTHORIZED,
        details: { message: 'Invalid credentials' }
      });
      const user = null;
      const info = { message: 'Invalid credentials' };
      
      const handler = testStrategy.handleResponse(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Act
      handler(error, user, info);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockReq.logIn).not.toHaveBeenCalled();
    });
    
    it('should call next with AppError if user is not provided', () => {
      // Arrange
      const error = null;
      const user = null;
      const info = { message: 'Invalid credentials' };
      
      const handler = testStrategy.handleResponse(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Act
      handler(error, user, info);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '认证失败',
          code: ErrorCode.UNAUTHORIZED,
        })
      );
      expect(mockReq.logIn).not.toHaveBeenCalled();
    });
    
    it('should log in user and call next if user is provided', () => {
      // Arrange
      const error = null;
      const user = { id: 'user123', email: 'test@example.com' };
      const info = {};
      
      const handler = testStrategy.handleResponse(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Mock the logIn method to call its callback with no error
      (mockReq.logIn as jest.Mock).mockImplementation((user, options, callback) => {
        (callback as (error: Error | null) => void)(null);
      });
      
      // Act
      handler(error, user, info);
      
      // Assert
      expect(mockReq.logIn).toHaveBeenCalledWith(
        user,
        { session: false },
        expect.any(Function)
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBe(user);
    });
    
    it('should call next with error if logIn fails', () => {
      // Arrange
      const error = null;
      const user = { id: 'user123', email: 'test@example.com' };
      const info = {};
      const loginError = new Error('Login failed');
      
      const handler = testStrategy.handleResponse(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Mock the logIn method to call its callback with an error
      (mockReq.logIn as jest.Mock).mockImplementation((_, __, callback) => {
        (callback as (error: Error) => void)(loginError);
      });
      
      // Act
      handler(error, user, info);
      
      // Assert
      expect(mockReq.logIn).toHaveBeenCalledWith(
        user,
        { session: false },
        expect.any(Function)
      );
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '登录失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: loginError,
        })
      );
    });
  });
  
  describe('initialize', () => {
    it('should initialize passport with the strategy', () => {
      // Arrange
      const mockStrategy = {};
      
      const mockedPassport = {
        use: jest.fn(),
      };
      
      // Mock the passport instance
      mockedPassport.use.mockReturnValue(undefined);
      
      // Mock the createStrategy method
      jest.spyOn(testStrategy as any, 'createStrategy').mockReturnValue(mockStrategy);
      
      // Act
      testStrategy.initialize();
      
      // Assert
      expect(testStrategy['createStrategy']).toHaveBeenCalled();
      expect(mockedPassport.use).toHaveBeenCalledWith('test-strategy', mockStrategy);
    });
  });
});