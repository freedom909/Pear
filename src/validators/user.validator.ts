import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ErrorResponse } from '../utils/errorResponse';

/**
 * 用户ID验证规则
 */
const userIdValidator = [
  param('id')
    .notEmpty().withMessage('用户ID不能为空')
    .isMongoId().withMessage('无效的用户ID格式'),

  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          400
        )
      );
    }
    next();
  }
];

/**
 * 创建用户验证规则
 */
export const createUserValidator = [
  // 验证用户名
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),

  // 验证邮箱
  body('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),

  // 验证密码
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度不能少于6个字符')
    .matches(/[0-9]/).withMessage('密码必须包含数字')
    .matches(/[a-zA-Z]/).withMessage('密码必须包含字母'),

  // 验证角色
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('角色只能是user或admin'),

  // 处理验证结果
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          400
        )
      );
    }
    next();
  }
];

/**
 * 更新用户验证规则
 */
export const updateUserValidator = [
  ...userIdValidator,

  // 验证用户名
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),

  // 验证邮箱
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),

  // 验证密码
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('密码长度不能少于6个字符')
    .matches(/[0-9]/).withMessage('密码必须包含数字')
    .matches(/[a-zA-Z]/).withMessage('密码必须包含字母'),

  // 验证角色
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('角色只能是user或admin'),

  // 处理验证结果
  (req: Request, _res: Response, next: NextFunction) => {//error TS6133: 'res' is declared but its value is never read.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          400
        )
      );
    }
    next();
  }
];

/**
 * 获取用户验证规则
 */
export const getUserValidator = userIdValidator;

/**
 * 删除用户验证规则
 */
export const deleteUserValidator = userIdValidator;