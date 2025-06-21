import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { logger } from '../utils/logger';
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 将请求体转换为DTO实例
      const dto = plainToInstance(dtoClass, req.body);

      // 验证DTO
      const errors: ValidationError[] = await validate(dto, {
        skipMissingProperties,
        whitelist: true,
        forbidNonWhitelisted: true
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

        return next(new ErrorResponse(`请求验证失败: ${errorMessages}`, 400));
      }

      // 验证通过，将验证后的数据附加到请求对象
      req.validatedBody = dto;
      next();
    } catch (error) {
      logger.error('请求验证中间件错误:', error);
      next(new ErrorResponse('请求验证处理失败', 500));
    }
  };
};

/**
 * 验证查询参数中间件
 * @param dtoClass DTO类
 */
export const validateQuery = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.query);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        return next(new ErrorResponse(`查询参数验证失败: ${errorMessages}`, 400));
      }

      req.validatedQuery = dto;
      next();
    } catch (error) {
      logger.error('查询参数验证中间件错误:', error);
      next(new ErrorResponse('查询参数验证处理失败', 500));
    }
  };
};

/**
 * 验证路径参数中间件
 * @param dtoClass DTO类
 */
export const validateParams = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.params);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        return next(new ErrorResponse(`路径参数验证失败: ${errorMessages}`, 400));
      }

      req.validatedParams = dto;
      next();
    } catch (error) {
      logger.error('路径参数验证中间件错误:', error);
      next(new ErrorResponse('路径参数验证处理失败', 500));
    }
  };
};