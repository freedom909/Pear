import { BaseValidator } from './base.validator';

export class UsernameValidator extends BaseValidator {
  static validate(field = 'username') {
    return [
      BaseValidator.createBodyValidator(field)
        .isLength({ min: 3 })
        .withMessage('用户名至少需要3个字符')
        .isLength({ max: 20 })
        .withMessage('用户名最多不能超过20个字符')
        .trim()
        .escape(),
      BaseValidator.handleValidationErrors
    ];
  }
}

export const localUsernameValidator = UsernameValidator.validate;