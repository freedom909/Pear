import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { BadRequestError, ErrorCode } from '../config/error.config';

/**
 * Validation middleware
 * @param validations - Array of validation chains
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Get validation errors
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        // Format validation errors
        const formattedErrors: Record<string, string> = {};
        
        errors.array().forEach(error => {
          if (error.type === 'field') {
            formattedErrors[error.path] = error.msg;
          }
        });
        
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Validation error',
          formattedErrors
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Common validation chains
 */
export const commonValidations = {
  // ID validation
  id: (fieldName: string = 'id') => ({
    in: ['params', 'body'],
    errorMessage: 'Invalid ID format',
    isMongoId: true,
    trim: true
  }),
  
  // Email validation
  email: {
    in: ['body'],
    errorMessage: 'Invalid email address',
    isEmail: true,
    normalizeEmail: true,
    trim: true
  },
  
  // Password validation
  password: {
    in: ['body'],
    errorMessage: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    isString: true,
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  // Name validation
  name: (fieldName: string) => ({
    in: ['body'],
    errorMessage: `${fieldName} is required and must be between 2 and 50 characters`,
    isString: true,
    trim: true,
    isLength: {
      options: { min: 2, max: 50 }
    }
  }),
  
  // Optional string validation
  optionalString: (fieldName: string, options: { min?: number; max?: number } = {}) => ({
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    ...(options.min && {
      isLength: {
        options: { min: options.min },
        errorMessage: `${fieldName} must be at least ${options.min} characters long`
      }
    }),
    ...(options.max && {
      isLength: {
        options: { max: options.max },
        errorMessage: `${fieldName} cannot exceed ${options.max} characters`
      }
    })
  }),
  
  // Page validation
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page must be a positive integer'
    },
    toInt: true
  },
  
  // Limit validation
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100'
    },
    toInt: true
  },
  
  // Sort validation
  sort: (allowedFields: string[]) => ({
    in: ['query'],
    optional: true,
    custom: {
      options: (value: string) => {
        if (!value) return true;
        
        const [field, order] = value.split(':');
        
        if (!field || !order) {
          throw new Error('Invalid sort format. Use field:asc or field:desc');
        }
        
        if (!allowedFields.includes(field)) {
          throw new Error(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`);
        }
        
        if (!['asc', 'desc'].includes(order.toLowerCase())) {
          throw new Error('Invalid sort order. Use asc or desc');
        }
        
        return true;
      }
    }
  })
};