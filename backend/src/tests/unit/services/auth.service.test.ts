import { describe, it, expect, jest } from '@jest/globals';
import * as authService from '../../../services/auth.service';
import { User } from '../../../models/user.model';

// 模拟依赖
jest.mock('../../../models/user.model');

describe('Auth Service', () => {
  describe('login', () => {
    it('should return token on successful login', async () => {
      // 模拟 User.findOne 返回用户
      (User.findOne as jest.Mock).mockResolvedValue({ 
        email: 'test@example.com', 
        comparePassword: jest.fn().mockResolvedValue(true) 
      });
      
      const result = await authService.login('test@example.com', 'password123');
      expect(result).toHaveProperty('token');
    });

    it('should throw error if password is incorrect', async () => {
      // 模拟 User.findOne 返回用户，但密码不匹配
      (User.findOne as jest.Mock).mockResolvedValue({ 
        email: 'test@example.com', 
        comparePassword: jest.fn().mockResolvedValue(false) 
      });
      
      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      // 模拟 User.findOne 返回 null
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow('User not found');
    });
  });

  describe('register', () => {
    it('should create new user', async () => {
      // 模拟 User.create 返回新用户
      (User.create as jest.Mock).mockResolvedValue({ email: 'new@example.com' });
      
      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User'
      });
      
      expect(result).toHaveProperty('email', 'new@example.com');
    });

    it('should throw error if email already exists', async () => {
      // 模拟 User.findOne 返回已存在的用户
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });
      
      await expect(authService.register({
        email: 'existing@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User'
      })).rejects.toThrow('Email already in use');
    });

    it('should validate password strength', async () => {
      // 模拟 User.findOne 返回 null
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(authService.register({
        email: 'new@example.com',
        password: 'weak',
        firstname: 'Test',
        lastname: 'User'
      })).rejects.toThrow('Password must be at least 8 characters');
    });
  });
});