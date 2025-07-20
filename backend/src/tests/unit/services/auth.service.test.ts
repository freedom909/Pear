import authService from '../../../services/auth.service';
import User from '../../../models/user/user.model';
import { AppError } from '../../../errors/appError';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { UserRole } from '../../../models/user/user.types';

jest.mock('../../../models/user/user.model');

describe('Auth Service Unit Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashed_password',
    username: 'testuser',
    role: UserRole.USER,
    comparePassword: jest.fn(),
    generateAuthToken: jest.fn(),
    generateRefreshToken: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser.comparePassword.mockResolvedValue(true as unknown as never);
    mockUser.generateAuthToken.mockReturnValue('mock-access-token');
    mockUser.generateRefreshToken.mockReturnValue('mock-refresh-token');
  });

  describe('login', () => {
    it('should return user and tokens when credentials are valid', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(mockUser as unknown as never)
      });

      const result = await authService.login('test@example.com', 'password123');
      
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'test@example.com' }, { email: 'test@example.com' }]
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(result).toEqual({
        user: {
          id: mockUser._id,
          username: { firstname: '', lastname: '' },
          email: mockUser.email,
          role: mockUser.role
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      });
    });

    it('should throw error when user not found', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(null as unknown as never)
      });
      
      await expect(authService.login('nonexistent@example.com', 'password123'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error when password is invalid', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(mockUser as unknown as never)
      });
      mockUser.comparePassword.mockResolvedValueOnce(false as unknown as never);
      
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const jwtVerify = jest.spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({ id: mockUser._id, email: mockUser.email, role: mockUser.role });
      
      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser as unknown as never);

      const result = await authService.refreshToken('valid-refresh-token');
      
      expect(jwtVerify).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        user: {
          id: mockUser._id,
          username: { firstname: '', lastname: '' },
          email: mockUser.email,
          role: mockUser.role
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      });
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({ id: 'nonexistent-id', email: 'test@example.com', role: UserRole.USER });
      
      (User.findById as jest.Mock).mockResolvedValueOnce(null as unknown as never);
      
      await expect(authService.refreshToken('valid-refresh-token'))
        .rejects
        .toThrow(AppError);
    });
  });
});