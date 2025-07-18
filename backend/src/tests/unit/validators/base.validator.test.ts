import { BaseValidator } from '../../../validators/base.validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult, Result } from 'express-validator';
import { AppError } from '../../../errors/appError';
import { Model } from 'mongoose';
import {jest, describe, expect, it, beforeEach} from '@jest/globals';

// Mock Express objects
const mockRequest = (body: any = {}) => ({
  body,
  method: 'POST',
  path: '/test',
}) as Request;

const mockResponse = () => ({} as Response);

const mockNext = jest.fn<NextFunction>();

// Mock Mongoose model
const mockModel = {
  exists: jest.fn(),
} as unknown as Model<any>;

// Mock validation result
const mockValidationResult = {
  isEmpty: jest.fn(),
  array: jest.fn(),
} as unknown as Result;

describe('BaseValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(validationResult, 'withDefaults').mockReturnValue(() => mockValidationResult);
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      mockValidationResult.isEmpty.mockReturnValue(true);

      BaseValidator.handleValidationErrors(mockRequest(), mockResponse(), mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass AppError to next when validation errors exist', () => {
      mockValidationResult.isEmpty.mockReturnValue(false);
      mockValidationResult.array.mockReturnValue([
        { param: 'test', msg: 'Test error', value: 'bad', location: 'body' },
      ]);

      BaseValidator.handleValidationErrors(mockRequest(), mockResponse(), mockNext);
      
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
      mockModel.exists.mockResolvedValue(true);

      const result = await BaseValidator.checkIdExists('validId', mockModel);
      expect(result).toBe(true);
      expect(mockModel.exists).toHaveBeenCalledWith({ _id: 'validId' });
    });

    it('should throw AppError when ID does not exist', async () => {
      mockModel.exists.mockResolvedValue(false);

      await expect(
        BaseValidator.checkIdExists('invalidId', mockModel)
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when model throws error', async () => {
      mockModel.exists.mockRejectedValue(new Error('DB error'));

      await expect(
        BaseValidator.checkIdExists('errorId', mockModel)
      ).rejects.toThrow(AppError);
    });
  });

  describe('createBodyValidator', () => {
    it('should create a validation chain with trim and escape', () => {
      const validator = BaseValidator.createBodyValidator('testField');
      expect(validator).toBeDefined();
      expect(validator.toString()).toContain('trim');
      expect(validator.toString()).toContain('escape');
    });
  });

  describe('validateLength', () => {
    it('should create length validation rules', () => {
      const validator = BaseValidator.validateLength(
        BaseValidator.createBodyValidator('username'),
        5,
        20,
        '用户名'
      );
      expect(validator.toString()).toContain('isLength');
    });
  });

  describe('validateEnum', () => {
    it('should create enum validation rules', () => {
      const validator = BaseValidator.validateEnum(
        BaseValidator.createBodyValidator('status'),
        ['active', 'inactive'],
        '状态'
      );
      expect(validator.toString()).toContain('isIn');
    });
  });

  describe('validateEmail', () => {
    it('should create email validation rules', () => {
      const validator = BaseValidator.validateEmail(
        BaseValidator.createBodyValidator('email'),
        '邮箱'
      );
      expect(validator.toString()).toContain('isEmail');
    });
  });
});