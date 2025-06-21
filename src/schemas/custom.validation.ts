import Joi from 'joi';

/**
 * 密码验证规则
 * - 至少8个字符
 * - 至少包含1个大写字母
 * - 至少包含1个小写字母
 * - 至少包含1个数字
 * - 至少包含1个特殊字符
 */
export const password = (value: string, helpers: Joi.CustomHelpers) => {
  if (value.length < 8) {
    return helpers.error('password.minLength');
  }

  if (!/[A-Z]/.test(value)) {
    return helpers.error('password.uppercase');
  }

  if (!/[a-z]/.test(value)) {
    return helpers.error('password.lowercase');
  }

  if (!/[0-9]/.test(value)) {
    return helpers.error('password.number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return helpers.error('password.special');
  }

  return value;
};

/**
 * 手机号验证规则
 * 支持中国大陆手机号格式
 */
export const phoneNumber = (value: string, helpers: Joi.CustomHelpers) => {
  if (!/^1[3-9]\d{9}$/.test(value)) {
    return helpers.error('phone.invalid');
  }

  return value;
};

/**
 * 用户名验证规则
 * - 4-16个字符
 * - 只能包含字母、数字、下划线
 * - 不能以数字开头
 */
export const username = (value: string, helpers: Joi.CustomHelpers) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{3,15}$/.test(value)) {
    return helpers.error('username.invalid');
  }

  return value;
};

/**
 * 中文姓名验证规则
 * - 2-20个汉字
 */
export const chineseName = (value: string, helpers: Joi.CustomHelpers) => {
  if (!/^[\u4e00-\u9fa5]{2,20}$/.test(value)) {
    return helpers.error('name.chinese');
  }

  return value;
};

/**
 * URL验证规则
 * - 必须是有效的URL格式
 * - 必须使用HTTPS协议
 */
export const secureUrl = (value: string, helpers: Joi.CustomHelpers) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') {
      return helpers.error('url.secure');
    }
    return value;
  } catch {
    return helpers.error('url.invalid');
  }
};

/**
 * 自定义错误消息
 */
export const customErrorMessages = {
  'password.minLength': '密码长度至少为8个字符',
  'password.uppercase': '密码必须包含至少1个大写字母',
  'password.lowercase': '密码必须包含至少1个小写字母',
  'password.number': '密码必须包含至少1个数字',
  'password.special': '密码必须包含至少1个特殊字符',
  'phone.invalid': '请输入有效的手机号码',
  'username.invalid': '用户名必须是4-16个字符，只能包含字母、数字、下划线，且不能以数字开头',
  'name.chinese': '姓名必须是2-20个汉字',
  'url.secure': 'URL必须使用HTTPS协议',
  'url.invalid': '请输入有效的URL',
};

/**
 * 自定义验证选项
 */
export const customValidationOptions = {
  errors: {
    wrap: {
      label: false,
    },
  },
  messages: customErrorMessages,
};