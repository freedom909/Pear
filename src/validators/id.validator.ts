import { param } from 'express-validator';
import { BaseValidator } from './base.validator';

/**
 * ID验证器 (安全增强版)
 */
export const idValidator = (field = 'id') => {
  return [
    param(field)
      .trim()
      .notEmpty().withMessage('ID不能为空')
      .isMongoId().withMessage('必须提供有效的MongoDB ID格式')
      .escape() // 防止XSS攻击
      .customSanitizer(value => {
        // 确保ID转换为字符串并去除潜在危险字符
        return String(value).replace(/[^a-f0-9]/g, '');
      })
      .isLength({ min: 24, max: 24 }).withMessage('ID长度必须为24个字符'),
    BaseValidator.handleValidationErrors
  ];
};