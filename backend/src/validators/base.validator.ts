import { Request, Response, NextFunction } from 'express';
import {
  body,
  param,
  validationResult,
  ValidationChain,
} from 'express-validator';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import { Model } from 'mongoose';

export abstract class BaseValidator {
  /**
   * Creates a body validation chain
   * @param field The field name to validate
   */
  static createBodyValidator(field: string): ValidationChain {
    return body(field).trim().escape();
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
    const errors = validationResult.withDefaults({
      formatter: (error) => error,
    })(req);
    
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

  /**
   * Checks if an ID exists in the database
   * @param id The ID to check
   * @param model The Mongoose model to check against
   * @returns True if the ID exists
   * @throws AppError if the ID does not exist
   */
  static async checkIdExists(id: string, model: Model<any>): Promise<boolean> {
    try {
      const exists = await model.exists({ _id: id });
      if (!exists) {
        throw new AppError({
          message: 'Resource not found',
          code: ErrorCode.NOT_FOUND,
        });
      }
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: 'Error checking resource existence',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Validates the length of a field
   * @param validator The validation chain
   * @param min The minimum length
   * @param max The maximum length
   * @param fieldName The field name for error messages
   * @returns The updated validation chain
   */
  static validateLength(
    validator: ValidationChain,
    min: number,
    max: number,
    fieldName: string
  ): ValidationChain {
    return validator
      .isLength({ min, max })
      .withMessage(`${fieldName}长度必须在${min}到${max}个字符之间`);
  }

  /**
   * Validates that a field is one of the allowed values
   * @param validator The validation chain
   * @param allowedValues The allowed values
   * @param fieldName The field name for error messages
   * @returns The updated validation chain
   */
  static validateEnum(
    validator: ValidationChain,
    allowedValues: string[],
    fieldName: string
  ): ValidationChain {
    return validator
      .isIn(allowedValues)
      .withMessage(`${fieldName}必须是以下值之一: ${allowedValues.join(', ')}`);
  }

  /**
   * Validates that a field is a valid email
   * @param validator The validation chain
   * @param fieldName The field name for error messages
   * @returns The updated validation chain
   */
  static validateEmail(
    validator: ValidationChain,
    fieldName: string
  ): ValidationChain {
    return validator
      .isEmail()
      .withMessage(`${fieldName}必须是有效的电子邮件地址`);
  }
}