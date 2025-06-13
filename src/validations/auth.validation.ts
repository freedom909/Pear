import { checkSchema } from 'express-validator';
import { commonValidations } from '../middlewares';

/**
 * Authentication validations
 */
export const authValidation = {
  /**
   * Register validation
   */
  register: checkSchema({
    email: commonValidations.email,
    password: commonValidations.password,
    firstName: commonValidations.name('First name'),
    lastName: commonValidations.name('Last name')
  }),

  /**
   * Login validation
   */
  login: checkSchema({
    email: commonValidations.email,
    password: {
      in: ['body'],
      errorMessage: 'Password is required',
      isString: true,
      notEmpty: true
    }
  }),

  /**
   * Refresh token validation
   */
  refreshToken: checkSchema({
    refreshToken: {
      in: ['body'],
      errorMessage: 'Refresh token is required',
      isString: true,
      notEmpty: true
    }
  }),

  /**
   * Logout validation
   */
  logout: checkSchema({
    refreshToken: {
      in: ['body'],
      errorMessage: 'Refresh token is required',
      isString: true,
      notEmpty: true
    }
  })
};