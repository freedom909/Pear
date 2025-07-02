import { Request, Response, NextFunction } from 'express';
import ErrorCode from '@/errors/error-code';
import { AppError } from '../errors/appError';
import logger from '../middleware/logger';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * 请求验证中间件
 * @param dtoClass DTO类
 * @param skipMissingProperties 是否跳过缺失的属性验证
 */
export const validateRequest = <T extends object>(
  dtoClass: new () => T,
  skipMissingProperties = false
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 将请求体转换为DTO实例
      const dto = plainToInstance(dtoClass, req.body);

      // 验证DTO
      const errors: ValidationError[] = await validate(dto, {
        skipMissingProperties,
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        // 提取错误消息
        const errorMessages = errors
          .map((error) => {
            if (error.constraints) {
              return Object.values(error.constraints).join(', ');
            }
            if (error.children && error.children.length > 0) {
              return error.children
                .map((childError) => {
                  if (childError.constraints) {
                    return Object.values(childError.constraints).join(', ');
                  }
                  return '';
                })
                .filter(Boolean)
                .join(', ');
            }
            return '';
          })
          .filter(Boolean)
          .join('; ');

        return next(
          new AppError({
            message: '请求验证失败',
            code: ErrorCode.VALIDATION_ERROR,
            details: errorMessages,
          })
        );
      }

      // 验证通过，将验证后的数据附加到请求对象
      // Extend the Request type to include the validatedBody property
      interface CustomRequest extends Request {
        validatedBody?: T;
      }
      (req as CustomRequest).validatedBody = dto;
      next();
    } catch (error) {
      logger.error('请求验证中间件错误:', error);
      next(
        new AppError({ message: '请求验证处理失败', error } as unknown as any)
      );
    }
  };
};

/**
 * 验证查询参数中间件
 * @param dtoClass DTO类
 */
export const validateQuery = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.query);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        return next(
          new AppError({
            message: '查询参数验证失败',
            errorMessages,
          } as unknown as any)
        );
      }

      // Extend the Request type to include the validatedQuery property
      interface CustomRequestQuery extends Request {
        validatedQuery?: T;
      }
      (req as CustomRequestQuery).validatedQuery = dto;
      next();
    } catch (error) {
      logger.error('查询参数验证中间件错误:', error);
      next(
        new AppError({
          message: '查询参数验证处理失败',
          error,
        } as unknown as any)
      );
    }
  };
};

/**
 * 验证路径参数中间件
 * @param dtoClass DTO类
 */
export const validateParams = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.params);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        return next(
          new AppError({
            message: '参数路径失败',
            errorMessages,
          } as unknown as any)
        );
      }

      // Extend the Request type to include the validatedParams property
      interface CustomRequestParams extends Request {
        validatedParams?: T;
      }
      (req as CustomRequestParams).validatedParams = dto;
      next();
    } catch (error) {
      logger.error('路径参数验证中间件错误:', error);
      next(new AppError({ message: '参数路径失败', error } as unknown as any));
    }
  };
};
