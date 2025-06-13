import { checkSchema } from 'express-validator';
import { commonValidations } from '../middlewares';
import { UserRole, UserStatus } from '../models';

/**
 * User validations
 */
export const userValidation = {
  /**
   * Update profile validation
   */
  updateProfile: checkSchema({
    firstName: {
      ...commonValidations.name('First name'),
      optional: true
    },
    lastName: {
      ...commonValidations.name('Last name'),
      optional: true
    },
    avatar: commonValidations.optionalString('Avatar URL', { max: 255 })
  }),

  /**
   * Change password validation
   */
  changePassword: checkSchema({
    currentPassword: {
      in: ['body'],
      errorMessage: 'Current password is required',
      isString: true,
      notEmpty: true
    },
    newPassword: commonValidations.password
  }),

  /**
   * Get user by ID validation
   */
  getUserById: checkSchema({
    id: commonValidations.id()
  }),

  /**
   * Get users list validation
   */
  getUsers: checkSchema({
    page: commonValidations.page,
    limit: commonValidations.limit,
    sort: commonValidations.sort(['createdAt', 'email', 'firstName', 'lastName', 'role', 'status']),
    search: {
      in: ['query'],
      optional: true,
      isString: true,
      trim: true
    }
  }),

  /**
   * Update user validation (Admin only)
   */
  updateUser: checkSchema({
    id: commonValidations.id(),
    firstName: {
      ...commonValidations.name('First name'),
      optional: true
    },
    lastName: {
      ...commonValidations.name('Last name'),
      optional: true
    },
    role: {
      in: ['body'],
      optional: true,
      isIn: {
        options: [Object.values(UserRole)],
        errorMessage: `Role must be one of: ${Object.values(UserRole).join(', ')}`
      }
    },
    status: {
      in: ['body'],
      optional: true,
      isIn: {
        options: [Object.values(UserStatus)],
        errorMessage: `Status must be one of: ${Object.values(UserStatus).join(', ')}`
      }
    },
    verified: {
      in: ['body'],
      optional: true,
      isBoolean: true,
      toBoolean: true
    }
  }),

  /**
   * Delete user validation (Admin only)
   */
  deleteUser: checkSchema({
    id: commonValidations.id()
  })
};