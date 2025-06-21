import Joi from 'joi';

/**
 * 更新用户验证模式
 */
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': '姓名长度至少为2个字符',
      'string.max': '姓名长度不能超过50个字符',
      'string.empty': '姓名不能为空',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .messages({
      'any.only': '角色必须是 user 或 admin',
    }),
  isActive: Joi.boolean()
    .messages({
      'boolean.base': '活跃状态必须是布尔值',
    }),
}).min(1).messages({
  'object.min': '至少需要提供一个更新字段',
});

/**
 * 更新用户活跃状态验证模式
 */
export const updateUserActiveStatusSchema = Joi.object({
  isActive: Joi.boolean()
    .required()
    .messages({
      'boolean.base': '活跃状态必须是布尔值',
      'any.required': '活跃状态是必填项',
    }),
});

/**
 * 用户查询参数验证模式
 */
export const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码必须大于或等于1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .messages({
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
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .messages({
      'any.only': '排序方向必须是 asc 或 desc',
    }),
  search: Joi.string()
    .max(100)
    .messages({
      'string.max': '搜索关键词不能超过100个字符',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .messages({
      'any.only': '角色必须是 user 或 admin',
    }),
  isActive: Joi.boolean()
    .messages({
      'boolean.base': '活跃状态必须是布尔值',
    }),
  isEmailVerified: Joi.boolean()
    .messages({
      'boolean.base': '邮箱验证状态必须是布尔值',
    }),
});