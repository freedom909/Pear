import rateLimiter from '../../../middleware/rateLimiter';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../errors/appError';
import rateLimit from 'express-rate-limit';

jest.mock('express-rate-limit');

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1'
    };
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should apply rate limiting with correct configuration', () => {
    const mockRateLimit = jest.fn().mockImplementation((options) => {
      expect(options.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(options.max).toBe(100);
      expect(options.message).toBe('Too many requests from this IP, please try again after 15 minutes');
      return (req: Request, res: Response, next: NextFunction) => next();
    });
    (rateLimit as jest.Mock).mockImplementation(mockRateLimit);

    const middleware = rateLimiter();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should throw error when rate limit is exceeded', () => {
    const mockRateLimit = jest.fn().mockImplementation(() => {
      return (req: Request, res: Response, next: NextFunction) => {
        const err = new Error('Rate limit exceeded');
        (err as any).statusCode = 429;
        next(err);
      };
    });
    (rateLimit as jest.Mock).mockImplementation(mockRateLimit);

    const middleware = rateLimiter();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes'
      })
    );
  });
});