import { Request, Response, NextFunction } from 'express';
import { Schema } from 'express-validator';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../config';

/**
 * Validate request middleware
 * @param schema Validation schema
 */
export const validate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apply validation schema
      await Promise.all(Object.values(schema).map(validation => validation.run(req)));

      // Get validation errors
      const errors = validationResult(req);

      // If there are errors, throw BadRequestError
      if (!errors.isEmpty()) {
        throw new BadRequestError('Validation error', {
          errors: errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
          }))
        });
      }

      // Continue to next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Common validation rules
 */
export const commonValidations = {
  /**
   * Email validation
   */
  email: {
    in: ['body'],
    errorMessage: 'Email is required',
    isEmail: {
      errorMessage: 'Invalid email format'
    },
    normalizeEmail: true,
    trim: true
  },

  /**
   * Password validation
   */
  password: {
    in: ['body'],
    errorMessage: 'Password is required',
    isString: true,
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter and one number'
    }
  },

  /**
   * Name validation
   * @param fieldName Field name for error messages
   */
  name: (fieldName: string) => ({
    in: ['body'],
    errorMessage: `${fieldName} is required`,
    isString: true,
    trim: true,
    notEmpty: true,
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: `${fieldName} must be between 2 and 50 characters long`
    }
  }),

  /**
   * Optional string validation
   * @param fieldName Field name for error messages
   * @param options Additional options
   */
  optionalString: (fieldName: string, options?: { min?: number; max?: number }) => ({
    in: ['body'],
    optional: true,
    isString: {
      errorMessage: `${fieldName} must be a string`
    },
    trim: true,
    ...(options?.min && {
      isLength: {
        options: { min: options.min },
        errorMessage: `${fieldName} must be at least ${options.min} characters long`
      }
    }),
    ...(options?.max && {
      isLength: {
        options: { max: options.max },
        errorMessage: `${fieldName} must be at most ${options.max} characters long`
      }
    })
  }),

  /**
   * ID validation
   */
  id: () => ({
    in: ['params'],
    errorMessage: 'Invalid ID',
    isMongoId: true
  }),

  /**
   * Page validation
   */
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page must be a positive integer'
    },
    toInt: true
  },

  /**
   * Limit validation
   */
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100'
    },
    toInt: true
  },

  /**
   * Sort validation
   * @param allowedFields Allowed fields to sort by
   */
  sort: (allowedFields: string[]) => ({
    in: ['query'],
    optional: true,
    isString: true,
    custom: {
      options: (value: string) => {
        // Split sort string into field and direction
        const [field, direction] = value.split(':');

        // Check if field is allowed
        if (!allowedFields.includes(field)) {
          throw new Error(
            `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
          );
        }

        // Check if direction is valid
        if (direction && !['asc', 'desc'].includes(direction.toLowerCase())) {
          throw new Error('Invalid sort direction. Use asc or desc');
        }

        return true;
      }
    }
  })
};