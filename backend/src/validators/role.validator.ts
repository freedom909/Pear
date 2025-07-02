import { body } from 'express-validator';
import { BaseValidator } from './base.validator';

/**
 * 角色验证器 (包含权限等级)
 */
export const roleValidator = (field = 'role') => {
  return [
    body(field)
      .trim()
      .notEmpty()
      .withMessage('角色不能为空')
      .isIn(['superadmin', 'admin', 'editor', 'user', 'guest'])
      .withMessage(
        '无效的角色类型，可选: superadmin, admin, editor, user, guest'
      )
      .custom((value, { req }) => {
        // 防止权限提升攻击
        if (req.user && req.user.role === 'user' && value === 'admin') {
          throw new Error('普通用户不能提升为管理员角色');
        }
        return true;
      }),
    BaseValidator.handleValidationErrors,
  ];
};
