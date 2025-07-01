// src/validators/auth.validator.ts

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import { password as passwordCustomRule } from './custom.validation';

/**
 * Helper: Middleware to validate req.body against a Joi schema
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
 * 注册验证模式
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.empty': '邮箱不能为空',
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项',
    }),
  password: Joi.string()
    .required()
    .custom(passwordCustomRule)
    .messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必填项',
    }),
  username: Joi.string()
    .required()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名长度至少为3个字符',
      'string.max': '用户名长度不能超过20个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'any.required': '用户名是必填项',
    }),
});

/**
 * 登录验证模式
 */
export const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'string.empty': '用户名或邮箱不能为空',
      'any.required': '用户名或邮箱是必填项',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必填项',
    }),
});

/**
 * 刷新令牌验证模式
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': '刷新令牌不能为空',
      'any.required': '刷新令牌是必填项',
    }),
});

/**
 * 登出验证模式
 */
export const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': '刷新令牌不能为空',
      'any.required': '刷新令牌是必填项',
    }),
});

/**
 * 忘记密码验证模式
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.empty': '邮箱不能为空',
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项',
    }),
});

/**
 * 重置密码验证模式
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': '重置令牌不能为空',
      'any.required': '重置令牌是必填项',
    }),
  password: Joi.string()
    .required()
    .custom(passwordCustomRule)
    .messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必填项',
    }),
});

/**
 * 更改密码验证模式
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': '当前密码不能为空',
      'any.required': '当前密码是必填项',
    }),
  newPassword: Joi.string()
    .required()
    .custom(passwordCustomRule)
    .messages({
      'string.empty': '新密码不能为空',
      'any.required': '新密码是必填项',
    }),
});
