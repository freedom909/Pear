import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../../models/user/user.model';
import { 
  handleOAuthUser, 
  linkOAuthToUser, 
  unlinkOAuthFromUser 
} from '../../../services/handleOAuthUser';
import { OAuthTokenInfo } from '../../../models/interface/index';
import { ValidationError, OAuthError } from '../../../errors/httpError';
import { expect, describe, it,beforeEach, beforeAll, afterAll } from '@jest/globals';
import { UserDocument } from '../../../models/user/user.types';

describe('OAuth User Services Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;

  // 在所有测试之前设置内存数据库
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // 在所有测试之后关闭连接
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // 在每个测试之前清理数据库
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('handleOAuthUser', () => {
    it('should create a new user when no matching user exists', async () => {
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
      } as OAuthTokenInfo;
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(result).toBeDefined();
      expect((result as any).googleId).toBe('google-123');
      expect(result.email).toBe('test@example.com');
      expect((result as any).googleAccessToken).toBe('access-token');
      expect((result as any).googleRefreshToken).toBe('refresh-token');
      expect((result as any).emailVerified).toBe(true);
      
      // 验证用户已保存到数据库
      const savedUser = await User.findOne({ googleId: 'google-123' });
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe('test@example.com');
    });

    it('should throw ValidationError when profile is missing required fields', async () => {
      // 准备测试数据 - 缺少 emails 字段
      const profile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'Test User',
        // emails 字段缺失
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      } as OAuthTokenInfo;
      
      // 执行测试
      await expect(handleOAuthUser(profile, tokenInfo))
        .rejects.toThrow(ValidationError);
    });

    it('should update existing user when found by provider ID', async () => {
      // 创建一个已存在的用户
      const existingUser = await User.create({
        googleId: 'google-123',
        email: 'old@example.com',
        firstname: 'Old',
        lastname: 'User'
      });
      
      // 准备测试数据
      const profile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'Updated User',
        emails: [{ value: 'updated@example.com' }],
        photos: [{ value: 'https://example.com/updated.jpg' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      } as OAuthTokenInfo;
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(result).toBeDefined();
      expect((result as any).googleId).toBe('google-123');
      expect(result.email).toBe('updated@example.com');
      expect((result as any).googleAccessToken).toBe('new-access-token');
      expect((result as any).googleRefreshToken).toBe('new-refresh-token');
      
      // 验证用户已更新
      const updatedUser = await User.findById(existingUser._id);
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.email).toBe('updated@example.com');
    });

    it('should update existing user when found by email', async () => {
      // 创建一个已存在的用户（通过邮箱匹配）
      const existingUser = await User.create({
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User'
      });
      
      // 准备测试数据
      const profile = {
        id: 'google-456',
        provider: 'google',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }]
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'access-token'
      } as OAuthTokenInfo;
      
      // 执行测试
      const result = await handleOAuthUser(profile, tokenInfo);
      
      // 验证结果
      expect(result).toBeDefined();
      expect((result as any).googleId).toBe('google-456');
      expect(result.email).toBe('test@example.com');
      expect((result as any).googleAccessToken).toBe('access-token');
      
      // 验证用户已更新
      const updatedUser = await User.findById(existingUser._id);
      expect(updatedUser).toBeDefined();
      expect((updatedUser as any).googleId).toBe('google-456');
    });
  });

  describe('linkOAuthToUser', () => {
    beforeEach(async () => {
      // 创建一个测试用户
      const user = await User.create({
        email: 'user@example.com',
        password: 'hashed-password',
        firstname: 'Test',
        lastname: 'User'
      });
      userId = user.id.toString();
    });

    it('should link OAuth account to existing user', async () => {
      // 准备测试数据
      const profile = {
        id: 'facebook-123',
        provider: 'facebook',
        displayName: 'Facebook User'
      };
      
      const tokenInfo: OAuthTokenInfo = {
        accessToken: 'fb-access-token',
        refreshToken: 'fb-refresh-token'
      } as OAuthTokenInfo;
      
      // 执行测试
      const result = await linkOAuthToUser(userId, profile, tokenInfo);
      
      // 验证结果
      expect(result).toBeDefined();
      expect((result as any).facebookId).toBe('facebook-123');
      expect((result as any).facebookAccessToken).toBe('fb-access-token');
      expect((result as any).facebookRefreshToken).toBe('fb-refresh-token');
      
      // 验证用户已更新
      const updatedUser = await User.findById(userId);
      expect(updatedUser).toBeDefined();
      expect((updatedUser as any).facebookId).toBe('facebook-123');
    });

    it('should throw error if OAuth account is already linked to another user', async () => {
      // 创建一个已关联 OAuth 的用户
      await User.create({
        email: 'another@example.com',
        facebookId: 'facebook-123'
      });
      
      // 准备测试数据
      const profile = {
        id: 'facebook-123',
        provider: 'facebook'
      };
      
      // 执行测试
      await expect(linkOAuthToUser(userId, profile, {} as OAuthTokenInfo))
        .rejects.toThrow(OAuthError);
    });
  });

  describe('unlinkOAuthFromUser', () => {
    beforeEach(async () => {
      // 创建一个测试用户，已关联 OAuth
      const user = await User.create({
        email: 'user@example.com',
        password: 'hashed-password',
        googleId: 'google-123',
        googleAccessToken: 'access-token',
        googleRefreshToken: 'refresh-token'
      });
      userId = user.id.toString();
    });

    it('should unlink OAuth provider from user', async () => {
      // 执行测试
      const result = await unlinkOAuthFromUser(userId, 'google');
      
      // 验证结果
      expect(result).toBeDefined();
      expect((result as any).googleId).toBeNull();
      expect((result as any).googleAccessToken).toBeNull();
      expect((result as any).googleRefreshToken).toBeNull();
      
      // 验证用户已更新
      const updatedUser = await User.findById(userId);
      expect(updatedUser).toBeDefined();
      expect((updatedUser as any).googleId).toBeNull();
    });

    it('should throw error if trying to unlink last login method', async () => {
      // 更新用户，移除密码（使 OAuth 成为唯一的登录方式）
      await User.findByIdAndUpdate(userId, { password: null });
      
      // 执行测试
      await expect(unlinkOAuthFromUser(userId, 'google'))
        .rejects.toThrow(ValidationError);
    });
  });
});