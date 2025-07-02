import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../errors/error-code';
import { AppError } from '../errors/appError';

/**
 * 处理404错误的中间件
 * 当没有路由匹配请求时，将创建一个NOT_FOUND错误
 */
export default function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(
    new AppError({
      message: ErrorCode.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
    })
  );
}
