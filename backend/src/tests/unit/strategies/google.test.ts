import { GoogleOAuthStrategy as GoogleStrategy } from '../../../strategies/google';
import { UserDocument } from '../../../models/user/user.types';
import { AuthProvider } from '../../../models/user/user.types';

import { Request, Response } from 'express';
import { Profile } from 'passport-google-oauth20';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../services/user.service');
const mockedUserService = {
  findUserByEmail: jest.fn(),
  findUserByProviderId: jest.fn(),
  createUser: jest.fn(),
  comparePassword: jest.fn(),
  getResetPasswordToken: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
} as jest.Mocked<typeof userService>;

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockDone: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of GoogleStrategy with mock config
    process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';
    
    googleStrategy = new GoogleStrategy(mockedUserService);
    
    // Mock the done callback
    mockDone = jest.fn();
  });

  describe('validate', () => {
    it('should create new user when user does not exist', async () => {
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: { givenName: 'Test', familyName: 'User' },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123',
        avatar: 'https://example.com/photo.jpg'
      } as unknown as UserDocument;

      mockedUserService.findUserByEmail.mockResolvedValue(null);
      mockedUserService.findUserByProviderId.mockResolvedValue(null);
      mockedUserService.createUser.mockResolvedValue(mockUser);

      await googleStrategy.validate('access-token', 'refresh-token', profile as Profile, mockDone);

      expect(mockedUserService.createUser).toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });

    // 其他测试用例...
  });

  describe('authenticate', () => {
    it('should call passport authenticate with correct options', () => {
      const mockReq = {} as Request;
      const mockNext = jest.fn();
      
      // 测试认证流程
      googleStrategy.authenticate(mockReq, {} as Response, mockNext);
      
      // 验证认证选项
      expect((googleStrategy as any).passport.authenticate).toHaveBeenCalled();
    });
  });
});