import { BaseValidator } from '../../../validators/base.validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../../../errors/appError';
import { Model } from 'mongoose';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

// Mock express-validator
jest.mock('express-validator', () => {
  return {
    body: jest.fn().mockReturnThis(),
    param: jest.fn().mockReturnThis(),
    validationResult: {
      withDefaults: jest.fn().mockImplementation(() => {
        return jest.fn().mockReturnValue({
          isEmpty: jest.fn().mockReturnValue(true),
          array: jest.fn().mockReturnValue([])
        });
      })
    }
  };
});

// Mock Express objects
const mockRequest = (body: any = {}) => {
  return {
    body,
    method: 'POST',
    path: '/test',
    headers: {},
    query: {},
    params: {},
    // Add other required properties from Express.Request
    get: jest.fn(),
    header: jest.fn(),
    // Add any other methods or properties needed
  } as unknown as Request;
};

const mockResponse = () => ({} as unknown as Response);

// Mock next function
const mockNext = jest.fn() as unknown as NextFunction;

// Mock Mongoose model
const mockModel = {
  exists: jest.fn()
} as unknown as Model<any>;

describe('BaseValidator', () => {
  let mockValidationResult: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock validation result
    mockValidationResult = {
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    };
    
    // Override the mock implementation for this test
    (validationResult.withDefaults as jest.Mock).mockImplementation(() => {
      return () => mockValidationResult;
    });
    
    // Setup default mock behaviors for model
    (mockModel.exists as jest.Mock).mockImplementation(() => Promise.resolve(true));
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      mockValidationResult.isEmpty.mockReturnValue(true);

      BaseValidator.handleValidationErrors(mockRequest() as any, mockResponse() as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass AppError to next when validation errors exist', () => {
      mockValidationResult.isEmpty.mockReturnValue(false);
      mockValidationResult.array.mockReturnValue([
        { param: 'test', msg: 'Test error', value: 'bad', location: 'body' },
      ]);

      BaseValidator.handleValidationErrors(mockRequest() as any, mockResponse() as any, mockNext);  

      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              param: 'test',
              msg: 'Test error'
            })
          ])
        })
      );
    });
  });

  describe('checkIdExists', () => {
    it('should return true when ID exists', async () => {
      (mockModel.exists as jest.Mock).mockImplementation(() => Promise.resolve(true));

      const result = await BaseValidator.checkIdExists('validId', mockModel);
      expect(result).toBe(true);
      expect(mockModel.exists).toHaveBeenCalledWith({ _id: 'validId' });
    });

    it('should throw AppError when ID does not exist', async () => {
      (mockModel.exists as jest.Mock).mockImplementation(() => Promise.resolve(false));

      await expect(
        BaseValidator.checkIdExists('invalidId', mockModel)
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when model throws error', async () => {
      (mockModel.exists as jest.Mock).mockImplementation(() => Promise.reject(new Error('DB error')));

      await expect(
        BaseValidator.checkIdExists('errorId', mockModel)
      ).rejects.toThrow(AppError);
    });
  });

  describe('createBodyValidator', () => {
    it('should create a validation chain with trim and escape', () => {
      const validator = BaseValidator.createBodyValidator('testField');
      expect(validator).toBeDefined();
    });
  });

  describe('validateLength', () => {
    it('should create length validation rules', () => {
      const mockValidator = {
        isLength: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis()
      };

      BaseValidator.validateLength(
        mockValidator as any,
        5,
        20,
        '用户名'
      );
      
      expect(mockValidator.isLength).toHaveBeenCalledWith({ min: 5, max: 20 });
      expect(mockValidator.withMessage).toHaveBeenCalledWith('用户名长度必须在5到20个字符之间');
    });
  });

  describe('validateEnum', () => {
    it('should create enum validation rules', () => {
      const mockValidator = {
        isIn: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis()
      };

      const allowedValues = ['active', 'inactive'];
      BaseValidator.validateEnum(
        mockValidator as any,
        allowedValues,
        '状态'
      );
      
      expect(mockValidator.isIn).toHaveBeenCalledWith(allowedValues);
      expect(mockValidator.withMessage).toHaveBeenCalledWith('状态必须是以下值之一: active, inactive');
    });
  });

  describe('validateEmail', () => {
    it('should create email validation rules', () => {
      const mockValidator = {
        isEmail: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis()
      };

      BaseValidator.validateEmail(
        mockValidator as any,
        '邮箱'
      );
      
      expect(mockValidator.isEmail).toHaveBeenCalled();
      expect(mockValidator.withMessage).toHaveBeenCalledWith('邮箱必须是有效的电子邮件地址');
    });
  });
});