import { Request, Response, NextFunction } from 'express';

/**
 * API Error Class
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errors: any[];
  isOperational: boolean;

  /**
   * Create a new API error
   * @param statusCode HTTP status code
   * @param message Error message
   * @param errors Additional error details
   * @param isOperational Whether the error is operational (default: true)
   */
  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a bad request error (400)
   * @param message Error message
   * @param errors Additional error details
   */
  static badRequest(message: string = 'Bad Request', errors: any[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  /**
   * Create an unauthorized error (401)
   * @param message Error message
   * @param errors Additional error details
   */
  static unauthorized(message: string = 'Unauthorized', errors: any[] = []): ApiError {
    return new ApiError(401, message, errors);
  }

  /**
   * Create a forbidden error (403)
   * @param message Error message
   * @param errors Additional error details
   */
  static forbidden(message: string = 'Forbidden', errors: any[] = []): ApiError {
    return new ApiError(403, message, errors);
  }

  /**
   * Create a not found error (404)
   * @param message Error message
   * @param errors Additional error details
   */
  static notFound(message: string = 'Not Found', errors: any[] = []): ApiError {
    return new ApiError(404, message, errors);
  }

  /**
   * Create a conflict error (409)
   * @param message Error message
   * @param errors Additional error details
   */
  static conflict(message: string = 'Conflict', errors: any[] = []): ApiError {
    return new ApiError(409, message, errors);
  }

  /**
   * Create an internal server error (500)
   * @param message Error message
   * @param errors Additional error details
   */
  static internal(message: string = 'Internal Server Error', errors: any[] = []): ApiError {
    return new ApiError(500, message, errors, false);
  }
}

/**
 * Error Handler Middleware
 * Global error handling middleware for Express
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error
  let error = err;

  // If error is not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], false);
  }

  const apiError = error as ApiError;

  // Send error response
  const response = {
    success: false,
    message: apiError.message,
    ...(apiError.errors.length > 0 && { errors: apiError.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
  };

  return res.status(apiError.statusCode).json(response);
};

/**
 * Not Found Handler
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};