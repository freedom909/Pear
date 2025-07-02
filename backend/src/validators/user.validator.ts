// src/validators/user.validator.ts

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
/**
 * Helper middleware to validate request body
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(
        new AppError({
          message: '参数验证失败',
          code: ErrorCode.VALIDATION_ERROR,
          details: error.details,
        })
      );
    }
    next();
  };
};

/**
 * Helper middleware to validate query params
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      return next(
        new AppError({
          message: '查询参数验证失败',
          code: ErrorCode.VALIDATION_ERROR,
          details: error.details,
        })
      );
    }
    next();
  };
};

/**
 * 创建用户验证模式
 */
export const createUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名长度至少为3个字符',
      'string.max': '用户名长度不能超过20个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'any.required': '用户名是必填项',
    }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱是必填项',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6个字符',
    'any.required': '密码是必填项',
  }),
  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': '角色必须是 user 或 admin',
  }),
});

/**
 * 更新用户验证模式
 */
export const updateUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.min': '用户名长度至少为3个字符',
      'string.max': '用户名长度不能超过20个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'string.empty': '用户名不能为空',
    }),
  email: Joi.string().email().lowercase().trim().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
  }),
  password: Joi.string().min(6).messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6个字符',
  }),
  name: Joi.string().min(2).max(50).messages({
    'string.min': '姓名长度至少为2个字符',
    'string.max': '姓名长度不能超过50个字符',
    'string.empty': '姓名不能为空',
  }),
  role: Joi.string().valid('user', 'admin').messages({
    'any.only': '角色必须是 user 或 admin',
  }),
  isActive: Joi.boolean().messages({
    'boolean.base': '活跃状态必须是布尔值',
  }),
})
  .min(1)
  .messages({
    'object.min': '至少需要提供一个更新字段',
  });

/**
 * 更新用户活跃状态验证模式
 */
export const updateUserActiveStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'boolean.base': '活跃状态必须是布尔值',
    'any.required': '活跃状态是必填项',
  }),
});

/**
 * 用户查询参数验证模式
 */
export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.min': '页码必须大于或等于1',
  }),
  limit: Joi.number().integer().min(1).max(100).messages({
    'number.base': '每页数量必须是数字',
    'number.integer': '每页数量必须是整数',
    'number.min': '每页数量必须大于或等于1',
    'number.max': '每页数量不能超过100',
  }),
  sortBy: Joi.string()
    .valid('name', 'email', 'role', 'createdAt', 'updatedAt', 'lastLogin')
    .messages({
      'any.only': '排序字段无效',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').messages({
    'any.only': '排序方向必须是 asc 或 desc',
  }),
  search: Joi.string().max(100).messages({
    'string.max': '搜索关键词不能超过100个字符',
  }),
  role: Joi.string().valid('user', 'admin').messages({
    'any.only': '角色必须是 user 或 admin',
  }),
  isActive: Joi.boolean().messages({
    'boolean.base': '活跃状态必须是布尔值',
  }),
  isEmailVerified: Joi.boolean().messages({
    'boolean.base': '邮箱验证状态必须是布尔值',
  }),
});

/**
 * 用户ID路径参数验证模式
 */
export const userIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      'string.empty': '用户ID不能为空',
      'string.pattern.base': '用户ID格式无效',
      'any.required': '用户ID是必填项',
    }),
});
