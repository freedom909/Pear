import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import User from '../../../models/user/user.model';
import { OAuthError, ValidationError } from '../../../errors/httpError';
import { 
  handleOAuthUser, 
  linkOAuthToUser, 
  unlinkOAuthFromUser,
  OAuthProvider 
} from '../../../services/handleOAuthUser';
import { OAuthTokenInfo } from '../../../models/interface/index';

// 模拟 User 模型
jest.mock('../../../models/user/user.model');

describe('OAuth User Services', () => {
  const VALID_ID = new mongoose.Types.ObjectId().toString();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOAuthUser', () => {
    it('should throw ValidationError if profile is invalid', async () => {
      // 测试无效的 profile
      await expect(handleOAuthUser(null, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
      
      await expect(handleOAuthUser({}, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
      
      await expect(handleOAuthUser({ id: '123' }, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
    });

    it('should update existing user found by providerId', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      
      const mockUser = {
        _id: VALID_ID,
        googleId: 'old-google-id',
        email: 'old@example.com',
        save: jest.fn().mockResolvedValue({
          _id: VALID_ID,
          googleId: 'google-123',
          email: 'test@example.com',
          googleAccessToken: 'access-token',
          googleRefreshToken: 'refresh-token'
        })
      };
      
      // 模拟 User.findOne 返回已存在的用户
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(User.findOne).toHaveBeenCalledWith({ googleId: 'google-123' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('googleId', 'google-123');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('googleAccessToken', 'access-token');
      expect(result).toHaveProperty('googleRefreshToken', 'refresh-token');
    });

    it('should update existing user found by email', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      
      const mockUser = {
        _id: VALID_ID,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue({
          _id: VALID_ID,
          googleId: 'google-123',
          email: 'test@example.com',
          googleAccessToken: 'access-token',
          googleRefreshToken: 'refresh-token'
        })
      };
      
      // 模拟 User.findOne 第一次返回 null，第二次返回用户（通过邮箱查找）
      (User.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(User.findOne).toHaveBeenCalledWith({ googleId: 'google-123' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('googleId', 'google-123');
    });

    it('should create new user if user does not exist', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      
      const newUser = {
        _id: VALID_ID,
        googleId: 'google-123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        emailVerified: true,
        profilePhoto: 'https://example.com/photo.jpg',
        googleAccessToken: 'access-token',
        googleRefreshToken: 'refresh-token'
      };
      
      // 模拟 User.findOne 返回 null（用户不存在）
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // 模拟 User.create 创建新用户
      (User.create as jest.Mock).mockResolvedValue(newUser);
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        googleId: 'google-123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        emailVerified: true,
        profilePhoto: 'https://example.com/photo.jpg',
        googleAccessToken: 'access-token',
        googleRefreshToken: 'refresh-token'
      }));
      
      expect(result).toEqual(newUser);
    });

    it('should handle profile with name object instead of displayName', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google',
        name: {
          firstname: 'John',
          lastname: 'Doe'
        },
        emails: [{ value: 'john.doe@example.com' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token'
      };
      
      // 模拟 User.findOne 返回 null（用户不存在）
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // 模拟 User.create 创建新用户
      (User.create as jest.Mock).mockImplementation(userData => Promise.resolve(userData));
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        googleId: 'google-123',
        firstname: 'John',
        lastname: 'Doe'
      }));
      
      expect(result).toHaveProperty('firstname', 'John');
      expect(result).toHaveProperty('lastname', 'Doe');
    });

    it('should handle errors gracefully', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google'
      };
      
      // 模拟 User.findOne 抛出错误
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // 执行测试
      await expect(handleOAuthUser(profile, {} as OAuthTokenInfo))
        .rejects.toThrow(OAuthError);
    });
  });

  describe('linkOAuthToUser', () => {
    it('should throw ValidationError if profile is invalid', async () => {
      await expect(linkOAuthToUser(VALID_ID, null, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
      
      await expect(linkOAuthToUser(VALID_ID, {}, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
    });

    it('should throw OAuthError if OAuth account is already linked to another user', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google'
      };
      
      const existingUser = {
        id: 'another-user-id',
        googleId: 'google-123'
      };
      
      // 模拟 User.findOne 返回已存在的用户
      (User.findOne as jest.Mock).mockResolvedValue(existingUser);
      
      // 执行测试
      await expect(linkOAuthToUser(VALID_ID, profile, {} as OAuthTokenInfo))
        .rejects.toThrow(OAuthError);
      
      expect(User.findOne).toHaveBeenCalledWith({ googleId: 'google-123' });
    });

    it('should throw ValidationError if user does not exist', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google'
      };
      
      // 模拟 User.findOne 返回 null（OAuth 账号未被关联）
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // 模拟 User.findById 返回 null（用户不存在）
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      // 执行测试
      await expect(linkOAuthToUser(VALID_ID, profile, {} as OAuthTokenInfo))
        .rejects.toThrow(ValidationError);
      
      expect(User.findById).toHaveBeenCalledWith(VALID_ID);
    });

    it('should link OAuth account to user successfully', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google'
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      
      const mockUser = {
        id: VALID_ID,
        save: jest.fn().mockResolvedValue({
          id: VALID_ID,
          googleId: 'google-123',
          googleAccessToken: 'access-token',
          googleRefreshToken: 'refresh-token'
        })
      };
      
      // 模拟 User.findOne 返回 null（OAuth 账号未被关联）
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // 模拟 User.findById 返回用户
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // 执行测试
      const result = await linkOAuthToUser(VALID_ID, profile, tokenInfo);
      
      // 验证结果
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('googleId', 'google-123');
      expect(result).toHaveProperty('googleAccessToken', 'access-token');
      expect(result).toHaveProperty('googleRefreshToken', 'refresh-token');
    });

    it('should handle errors gracefully', async () => {
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google'
      };
      
      // 模拟 User.findOne 抛出错误
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // 执行测试
      await expect(linkOAuthToUser(VALID_ID, profile, {} as OAuthTokenInfo))
        .rejects.toThrow(OAuthError);
    });
  });

  describe('unlinkOAuthFromUser', () => {
    it('should throw ValidationError if user does not exist', async () => {
      // 模拟 User.findById 返回 null
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      // 执行测试
      await expect(unlinkOAuthFromUser(VALID_ID, 'google'))
        .rejects.toThrow(ValidationError);
      
      expect(User.findById).toHaveBeenCalledWith(VALID_ID);
    });

    it('should throw ValidationError if trying to unlink last login method', async () => {
      // 准备测试数据
      const mockUser = {
        id: VALID_ID,
        password: null,
        googleId: 'google-123',
        facebookId: null,
        twitterId: null,
        appleId: null
      };
      
      // 模拟 User.findById 返回用户
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // 执行测试
      await expect(unlinkOAuthFromUser(VALID_ID, 'google'))
        .rejects.toThrow(ValidationError);
    });

    it('should unlink OAuth provider successfully', async () => {
      // 准备测试数据
      const mockUser = {
        id: VALID_ID,
        password: 'hashed-password', // 用户有密码，可以解除 OAuth 关联
        googleId: 'google-123',
        googleAccessToken: 'access-token',
        googleRefreshToken: 'refresh-token',
        save: jest.fn().mockResolvedValue({
          id: VALID_ID,
          password: 'hashed-password',
          googleId: null,
          googleAccessToken: null,
          googleRefreshToken: null
        })
      };
      
      // 模拟 User.findById 返回用户
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // 执行测试
      const result = await unlinkOAuthFromUser(VALID_ID, 'google');
      
      // 验证结果
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('googleId', null);
      expect(result).toHaveProperty('googleAccessToken', null);
      expect(result).toHaveProperty('googleRefreshToken', null);
    });
    
    it('should handle errors gracefully', async () => {
      // 模拟 User.findById 抛出错误
      (User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // 执行测试
      await expect(unlinkOAuthFromUser(VALID_ID, 'google'))
        .rejects.toThrow(OAuthError);
    });
  });