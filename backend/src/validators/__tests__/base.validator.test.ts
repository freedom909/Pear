import { BaseValidator } from '../base.validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../../utils/errors/app-error';
import { Model } from 'mongoose';

// Mock Express objects
const mockRequest = (body: any = {}) =>
  ({
    body,
    method: 'POST',
    path: '/test',
  }) as Request;

const mockResponse = () => {
  const res = {} as Response;
  return res;
};

const mockNext = jest.fn() as NextFunction;

// Mock Mongoose model
const mockModel = {
  exists: jest.fn(),
} as unknown as Model<any>;

describe('BaseValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      const req = mockRequest();
      const res = mockResponse();

      // Mock validationResult to return no errors
      jest.spyOn(validationResult, 'isEmpty').mockReturnValue(true);

      BaseValidator.handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('should throw AppError when validation errors exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      // Mock validationResult to return errors
      jest.spyOn(validationResult, 'isEmpty').mockReturnValue(false);
      jest
        .spyOn(validationResult, 'array')
        .mockReturnValue([
          { param: 'test', msg: 'Test error', value: 'bad', location: 'body' },
        ]);

      expect(() => {
        BaseValidator.handleValidationErrors(req, res, mockNext);
      }).toThrow(AppError);
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
  });

  describe('createBodyValidator', () => {
    it('should create a validation chain with trim and escape', () => {
      const validator = BaseValidator.createBodyValidator('testField');
      expect(validator).toBeDefined();
      // Would need integration tests to fully verify the chain
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
      expect(validator).toBeDefined();
    });
  });

  describe('validateEnum', () => {
    it('should create enum validation rules', () => {
      const validator = BaseValidator.validateEnum(
        BaseValidator.createBodyValidator('status'),
        ['active', 'inactive'],
        '状态'
      );
      expect(validator).toBeDefined();
    });
  });

  // Additional tests for other methods would go here
});
