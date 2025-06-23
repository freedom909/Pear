import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ErrorResponse } from '../utils/errorResponse';

/**
 * 注册验证规则
 */
export const registerValidator = [
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

  // 处理验证结果
async  (req: Request, _res: Response, next: NextFunction) => {
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
 * 登录验证规则
 */
export const loginValidator = [
  // 验证用户名或邮箱
  body('identifier')
    .notEmpty().withMessage('用户名或邮箱不能为空'),

  // 验证密码
  body('password')
    .notEmpty().withMessage('密码不能为空'),

  // 处理验证结果
async  (req: Request, _res: Response, next: NextFunction) => {
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
 * 刷新令牌验证规则
 */
export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty().withMessage('刷新令牌不能为空'),

 async (req: Request, _res: Response, next: NextFunction) => {
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