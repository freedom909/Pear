import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { LoggerConfig } from '../config/logger.config';

/**
 * Middleware to validate request against a Zod schema
 * @param schema Zod schema to validate against
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      
      // If validation passes, continue
      return next();
    } catch (error) {
      // If validation fails, return error response
      if (error instanceof ZodError) {
        LoggerConfig.warn('Validation error', { error: error.errors });
        
        // Format error messages
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      // If other error, pass to error handler
      return next(error);
    }
  };
};