import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/appError';

/**
 * 验证中间件
 * 用于验证请求数据的有效性
 * @param schema Joi验证模式
 * @param property 要验证的请求属性，默认为body
 */
export const validate = (schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // 返回所有错误
      stripUnknown: true, // 删除未知字段
      errors: {
        wrap: {
          label: false, // 不包装标签
        },
      },
    });

    if (!error) {
      return next();
    }

    // 格式化错误信息
    const errors: Record<string, string> = {};
    error.details.forEach((detail) => {
      const key = detail.path.join('.');
      errors[key] = detail.message;
    });

    // 创建验证错误
    const validationError = AppError.validation('请求数据验证失败', errors);
    next(validationError);
  };
};