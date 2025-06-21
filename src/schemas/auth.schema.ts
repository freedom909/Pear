import Joi from 'joi';
import { password } from './custom.validation';

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
    .custom(password)
    .messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必填项',
    }),
  name: Joi.string()
    .required()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名长度至少为2个字符',
      'string.max': '姓名长度不能超过50个字符',
      'any.required': '姓名是必填项',
    }),
});

/**
 * 登录验证模式
 */
export const loginSchema = Joi.object({
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
    .custom(password)
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
    .custom(password)
    .messages({
      'string.empty': '新密码不能为空',
      'any.required': '新密码是必填项',
    }),
});