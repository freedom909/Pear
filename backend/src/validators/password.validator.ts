import { body } from 'express-validator';
import { BaseValidator } from './base.validator';

/**
 * 密码验证器 (包含强度验证)
 */
export const passwordValidator = (field = 'password') => {
  return [
    body(field)
      .trim()
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 8, max: 32 })
      .withMessage('密码长度需在8-32个字符之间')
      .matches(/[0-9]/)
      .withMessage('密码必须包含数字')
      .matches(/[a-z]/)
      .withMessage('密码必须包含小写字母')
      .matches(/[A-Z]/)
      .withMessage('密码必须包含大写字母')
      .matches(/[^a-zA-Z0-9]/)
      .withMessage('密码必须包含特殊字符'),
    BaseValidator.handleValidationErrors,
  ];
};
