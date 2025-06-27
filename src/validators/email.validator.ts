import { BaseValidator } from './base.validator';

export class EmailValidator extends BaseValidator {
  static validate(field = 'email') {
    return [
      this.createBodyValidator(field)
        .isEmail()
        .withMessage('必须提供有效的邮箱地址')
        .normalizeEmail(),
      this.handleValidationErrors
    ];
  }
}

export const emailValidator = EmailValidator.validate;