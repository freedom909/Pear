import { emailValidator } from '../email.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

describe('emailValidator', () => {
  const simulateValidation = async (value: any) => {
    const req = {
      body: { email: value },
      method: 'POST',
      path: '/test'
    } as Request;
    
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    const validator = emailValidator();
    await validator[0](req, res, next);
    const result = validationResult(req);
    
    return {
      errors: result.array(),
      nextCalled: next.mock.calls.length > 0
    };
  };

  it('should reject empty email', async () => {
    const { errors } = await simulateValidation('');
    expect(errors[0].msg).toBe('邮箱不能为空');
  });

  it('should reject invalid email format', async () => {
    const { errors } = await simulateValidation('not-an-email');
    expect(errors[0].msg).toBe('必须提供有效的邮箱地址');
  });

  it('should accept valid email', async () => {
    const { errors } = await simulateValidation('test@example.com');
    expect(errors.length).toBe(0);
  });

  it('should trim whitespace', async () => {
    const { errors } = await simulateValidation('  test@example.com  ');
    expect(errors.length).toBe(0);
  });
});