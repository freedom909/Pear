import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.util';

/**
 * Validation Middleware
 * Handles request data validation using express-validator
 */
export class ValidationMiddleware {
  /**
   * Process validation errors
   */
  private static handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'Validation error', errors.array()));
    }
    next();
  }

  /**
   * Validate user registration data
   */
  static validateRegistration = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    body('profile.name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('profile.gender')
      .optional()
      .isString()
      .withMessage('Gender must be a string'),
    body('profile.location')
      .optional()
      .isString()
      .withMessage('Location must be a string'),
    body('profile.website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate login data
   */
  static validateLogin = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate refresh token
   */
  static validateRefreshToken = [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate email only
   */
  static validateEmail = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate password reset
   */
  static validatePasswordReset = [
    param('token')
      .notEmpty()
      .withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate password change
   */
  static validatePasswordChange = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    ValidationMiddleware.handleValidationErrors,
  ];

  /**
   * Validate profile update
   */
  static validateProfileUpdate = [
    body('profile.name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('profile.gender')
      .optional()
      .isString()
      .withMessage('Gender must be a string'),
    body('profile.location')
      .optional()
      .isString()
      .withMessage('Location must be a string'),
    body('profile.website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('profile.picture')
      .optional()
      .isURL()
      .withMessage('Picture must be a valid URL'),
    ValidationMiddleware.handleValidationErrors,
  ];
}