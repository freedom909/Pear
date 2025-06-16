import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';

/**
 * Handle 404 Not Found errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};