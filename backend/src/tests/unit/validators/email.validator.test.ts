import { emailValidator } from '../../../validators/email.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { jest, describe, it, expect } from '@jest/globals';

describe('emailValidator', () => {
  const simulateValidation = async (value: any) => {
    const req = {
      body: { email: value },
      method: 'POST',
      path: '/test',
    } as Request;

    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    const validator = emailValidator();
    await validator[0](req, res, next);
    const result = validationResult(req);

    return {
      errors: result.array(),
      nextCalled: next.mock.calls.length > 0,
    };
  };

  describe('Validation cases', () => {
    it('should reject empty email', async () => {
      const { errors } = await simulateValidation('');
      expect(errors[0].msg).toBe('邮箱不能为空');
    });

    it('should reject whitespace-only email', async () => {
      const { errors } = await simulateValidation('   ');
      expect(errors[0].msg).toBe('邮箱不能为空');
    });

    it('should reject null email', async () => {
      const { errors } = await simulateValidation(null);
      expect(errors[0].msg).toBe('邮箱不能为空');
    });

    it('should reject undefined email', async () => {
      const { errors } = await simulateValidation(undefined);
      expect(errors[0].msg).toBe('邮箱不能为空');
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        'invalid@.com',
        '@missingusername.com',
        'spaces in@email.com'
      ];

      for (const email of invalidEmails) {
        const { errors } = await simulateValidation(email);
        expect(errors[0].msg).toBe('必须提供有效的邮箱地址');
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@domain.co',
        'user_name@sub.domain.com',
        'user@sub.domain.co.uk'
      ];

      for (const email of validEmails) {
        const { errors } = await simulateValidation(email);
        expect(errors.length).toBe(0);
      }
    });

    it('should trim whitespace from valid emails', async () => {
      const { errors } = await simulateValidation('  test@example.com  ');
      expect(errors.length).toBe(0);
    });
  });

  describe('Middleware behavior', () => {
    it('should call next() when validation passes', async () => {
      const { nextCalled } = await simulateValidation('test@example.com');
      expect(nextCalled).toBe(true);
    });

    it('should not call next() when validation fails', async () => {
      const { nextCalled } = await simulateValidation('invalid-email');
      expect(nextCalled).toBe(false);
    });
  });
});