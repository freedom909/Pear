import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../config/index.js';

/**
 * Middleware to handle 404 Not Found errors
 * This middleware should be used after all routes are defined
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
};