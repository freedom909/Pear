import { Request, Response, NextFunction } from 'express';
import { register } from '../../../controllers/auth.controller';
import { AppError } from '../../../errors/appError';
import { ErrorCode } from '../../../errors/error-code';
import { container } from 'tsyringe';
import { AuthService } from '../../../services/auth.service';

// Mock AuthService
jest.mock('../../../services/auth.service');

describe('Auth Controller - Register', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    authService = container.resolve(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    mockRequest.body = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      passwordConfirm: '',
    };

    await register(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Please provide all required fields',
        code: ErrorCode.BAD_REQUEST,
      })
    );
  });

  it('should call AuthService.register and return success response', async () => {
    mockRequest.body = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    };

    authService.register.mockResolvedValueOnce({
      token: 'mockToken',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'user',
      },
    });

    await register(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(authService.register).toHaveBeenCalledWith(mockRequest.body);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});