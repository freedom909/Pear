import { Request, Response, NextFunction } from 'express';
import { LoggerConfig } from '../config/logger.config.js';

/**
 * Error response interface
 */
interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const status = 'status' in err ? err.status : 'error';

  // Log error
  LoggerConfig.error(`${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status,
    message: err.message
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};