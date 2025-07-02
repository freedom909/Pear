import { Request, Response, NextFunction } from 'express';
import {
  body,
  param,
  validationResult,
  ValidationChain,
} from 'express-validator';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';

export abstract class BaseValidator {
  /**
   * Creates a body validation chain
   * @param field The field name to validate
   */
  static createBodyValidator(field: string): ValidationChain {
    return body(field);
  }

  /**
   * Creates a param validation chain
   * @param field The field name to validate
   */
  static createParamValidator(field: string): ValidationChain {
    return param(field);
  }

  /**
   * Handles validation errors
   */
  static handleValidationErrors(req: Request, _: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        param: (error as any).param,
        msg: error.msg,
        ...((error as any).value && { value: (error as any).value }),
        ...((error as any).location && { location: (error as any).location }),
      }));

      return next(
        new AppError({
          message: 'Validation failed',
          code: ErrorCode.VALIDATION_ERROR,
          details: formattedErrors,
        })
      );
    }
    next();
  }
}
