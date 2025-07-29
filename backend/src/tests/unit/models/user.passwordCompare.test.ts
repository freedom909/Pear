

// src/tests/unit/models/user.comparePassword.test.ts
import { expect, describe, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import User from '../../../models/user/user.model';

describe('User model - comparePassword', () => {
  it('should return true for correct password', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: any = new User({ password: hashedPassword });

    // Force password to be set directly since it's select: false
    user.password = hashedPassword;

    const result = await user.comparePassword(password);
    expect(result).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: any = new User({ password: hashedPassword });
    user.password = hashedPassword;

    const result = await user.comparePassword('WrongPassword!');
    expect(result).toBe(false);
  });

  it('should return false if password is not set', async () => {
    const user: any = new User({});
    user.password = undefined;

    const result = await user.comparePassword('anything');
    expect(result).toBe(false);
  });
});
