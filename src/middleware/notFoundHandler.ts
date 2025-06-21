import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * 处理404未找到的路由
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};