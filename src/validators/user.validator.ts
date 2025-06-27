// validators/user.validator.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import { emailValidator } from './email.validator';
import { localUsernameValidator } from './username.validator';
import { passwordValidator } from './password.validator';
import { roleValidator } from './role.validator';
import { idValidator } from './id.validator';

/**
 * 统一验证错误处理中间件
 */
const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      param: 'param' in error ? error.param : undefined,
      msg: error.msg,
      ...(('value' in error && error.value !== undefined) && { value: error.value }),
      ...(('location' in error && error.location) && { location: error.location }),
    }));

    return next(
      new AppError({
        message: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: { errors: formattedErrors },
      })
    );
  }
  next();
};

/**
 * A validator can be a ValidationChain or a middleware function.
 */
type Validator = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

/**
 * 用户ID验证规则
 */
export const userIdValidator: Validator[] = [
  ...idValidator(),
  handleValidationErrors,
];

/**
 * 创建用户验证规则
 */
export const createUserValidator: Validator[] = [
  ...localUsernameValidator(),
  ...emailValidator(),
  ...passwordValidator(),
  ...roleValidator(),
  handleValidationErrors,
];

/**
 * 更新用户验证规则
 */
export const updateUserValidator: Validator[] = [
  ...idValidator(),
  ...localUsernameValidator('username').filter((v): v is ValidationChain => 'optional' in v).map((v) => v.optional()),
  ...emailValidator('email').filter((v): v is ValidationChain => 'optional' in v).map((v) => v.optional()),
  ...passwordValidator('password').filter((v): v is ValidationChain => 'optional' in v).map((v) => v.optional()),
  ...roleValidator('role').filter((v): v is ValidationChain => 'optional' in v).map((v) => v.optional()),
  handleValidationErrors,
];

/**
 * 获取用户验证规则
 */
export const getUserValidator: Validator[] = userIdValidator;

/**
 * 删除用户验证规则
 */
export const deleteUserValidator: Validator[] = userIdValidator;
