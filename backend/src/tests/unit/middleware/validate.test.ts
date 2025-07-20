import { validate } from '../../../validators/validate';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../errors/appError';
import Joi from 'joi';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const testSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should pass validation for valid input', () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123'
    };

    validate(testSchema)(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should throw error for invalid email', () => {
    mockRequest.body = {
      email: 'invalid-email',
      password: 'password123'
    };

    validate(testSchema)(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: '"email" must be a valid email'
      })
    );
  });

  it('should throw error for short password', () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'short'
    };

    validate(testSchema)(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: '"password" length must be at least 8 characters long'
      })
    );
  });

  it('should throw error for missing required field', () => {
    mockRequest.body = {
      email: 'test@example.com'
    };

    validate(testSchema)(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: '"password" is required'
      })
    );
  });
});