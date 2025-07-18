import { roleValidator } from '../../../validators/role.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { jest,describe,it,expect } from '@jest/globals';

describe('roleValidator', () => {
  const simulateValidation = async (value: any, field = 'role') => {
    const req = {
      body: { [field]: value },
      method: 'POST',
      path: '/test',
    } as Request;

    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    const validator = roleValidator(field);
    await validator[0](req, res, next);
    const result = validationResult(req);

    return {
      errors: result.array(),
      // nextCalled: next.mock.calls.length > 0,
    };
  };

  it('should reject empty role', async () => {
    const { errors } = await simulateValidation('');
    expect(errors[0].msg).toBe('角色不能为空');
  });

  it('should reject invalid role', async () => {
    const { errors } = await simulateValidation('invalid_role');
    expect(errors[0].msg).toContain('无效的角色类型');
  });

  it('should accept valid roles', async () => {
    const validRoles = ['superadmin', 'admin', 'editor', 'user', 'guest'];

    for (const role of validRoles) {
      const { errors } = await simulateValidation(role);
      expect(errors.length).toBe(0);
    }
  });

  it('should work with custom field name', async () => {
    const { errors } = await simulateValidation('admin', 'userRole');
    expect(errors.length).toBe(0);
  });
});
