import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../errors/app-error';
import { emailValidator } from './email.validator';
import { localUsernameValidator } from './username.validator';
import { passwordValidator } from './password.validator';
import { roleValidator } from './role.validator';
import { idValidator } from './id.validator';

type ValidatorArray = Array<ReturnType<typeof emailValidator>>;

/**
 * 统一验证错误处理中间件
 */
const handleValidationErrors = (req: Request, _: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      param: error.param,
      msg: error.msg,
      ...(error as any).value && { value: (error as any).value },
      ...(error as any).location && { location: (error as any).location }
    }));

    return next(
      new AppError({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: { errors: formattedErrors }
      })
    );
  }
  next();
};

/**
 * 用户ID验证规则
 */
const userIdValidator: ValidatorArray = [
  ...idValidator(),
  handleValidationErrors
];

/**
 * 创建用户验证规则
 */
export const createUserValidator: ValidatorArray = [
  ...localUsernameValidator(),
  ...emailValidator(),
  ...passwordValidator(),
  ...roleValidator(),
  handleValidationErrors
];

/**
 * 更新用户验证规则
 */
export const updateUserValidator: ValidatorArray = [
  ...userIdValidator,
  ...localUsernameValidator('username').map(v => v.optional()),
  ...emailValidator('email').map(v => v.optional()),
  ...passwordValidator('password').map(v => v.optional()),
  ...roleValidator('role').map(v => v.optional()),
  handleValidationErrors
];

/**
 * 获取用户验证规则
 */
export const getUserValidator = userIdValidator;

/**
 * 删除用户验证规则
 */
export const deleteUserValidator = userIdValidator;