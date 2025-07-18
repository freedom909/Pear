import { AppError } from '../../../errors/appError';
import { jest, describe, it, expect } from '@jest/globals';
import { ErrorCode } from '../../../errors/error-code';

describe('AppError', () => {
  it('should create an error with status code', () => {
    const error = new AppError({
        message: 'Test error',
        code: ErrorCode.BAD_REQUEST,
        details: 'Test error'
      });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('error');
  });

  it('should default to 500 status code', () => {
    const error = new AppError({
        message: 'Server error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: 'Server error'
      });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Server error');
    
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
  });

  it('should include error code when provided', () => {
    const error = new AppError({
        message: 'Error with code',
        code: ErrorCode.BAD_REQUEST,
        details: 'Invalid input'
      });
    
    expect(error.code).toBe(ErrorCode.BAD_REQUEST);
  });

  it('should include details when provided', () => {
    const details = { field: 'username', issue: 'required' };
    const error = new AppError({
        message: 'Error with details',
        code: ErrorCode.BAD_REQUEST,
        details
      });
    
    expect(error.details).toEqual(details);
  });
});