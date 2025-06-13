import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, LoggerConfig } from '../config';

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  LoggerConfig.error('Error occurred', {
    error,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user
  });

  // Handle AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Handle MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        details: {
          field,
          value: (error as any).keyValue[field]
        }
      }
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation error',
        details: error.message
      }
    });
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error'
    }
  });
};