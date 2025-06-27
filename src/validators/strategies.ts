import { body, param } from 'express-validator';

/**
 * 通用邮箱验证规则
 */
export const emailValidator = (field = 'email') => 
  body(field)
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail();

/**
 * 本地用户名验证规则
 */
export const localUsernameValidator = (field = 'username') =>
  body(field)
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线');

/**
 * 社交用户名验证规则 (更宽松)
 */
export const socialUsernameValidator = (field = 'username') =>
  body(field)
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2, max: 30 }).withMessage('用户名长度必须在2-30个字符之间');

/**
 * 密码验证规则
 */
export const passwordValidator = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度不能少于6个字符')
    .matches(/[0-9]/).withMessage('密码必须包含数字')
    .matches(/[a-zA-Z]/).withMessage('密码必须包含字母');

/**
 * 角色验证规则
 */
export const roleValidator = (field = 'role') =>
  body(field)
    .optional()
    .isIn(['user', 'admin']).withMessage('角色只能是user或admin');

/**
 * ID验证规则
 */
export const idValidator = (field = 'id') =>
  param(field)
    .notEmpty().withMessage('ID不能为空')
    .isMongoId().withMessage('无效的ID格式');