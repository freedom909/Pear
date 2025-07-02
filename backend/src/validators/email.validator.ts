import { BaseValidator } from './base.validator';

export class EmailValidator extends BaseValidator {
  static validate(field = 'email') {
    return [
      BaseValidator.createBodyValidator(field)
        .isEmail()
        .withMessage('必须提供有效的邮箱地址')
        .normalizeEmail(),
      BaseValidator.handleValidationErrors,
    ];
  }
}

export const emailValidator = EmailValidator.validate;
