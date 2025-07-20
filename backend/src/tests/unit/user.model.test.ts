import mongoose from 'mongoose';
import User from '../../models/user/user.model';
import bcrypt from 'bcryptjs';
import {describe,expect,it,beforeAll,beforeEach,afterAll} from '@jest/globals';

// 在测试之前，确保数据库连接成功
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST || '');
});


describe('User Model', () => {
  beforeAll(async () => {
    // 连接到测试数据库
    await mongoose.connect(process.env.MONGODB_URI_TEST || '');
  });

  beforeEach(async () => {
    // 清空用户集合
    await User.deleteMany({});
  });

  afterAll(async () => {
    // 断开数据库连接
    await mongoose.disconnect();
  });

  describe('创建用户', () => {
    it('应该成功创建新用户', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.name);
      expect(user.password).not.toBe(userData.password); // 密码应该被加密
      expect(user.isActive).toBe(true); // 默认值
      expect(user.isVerified).toBe(false); // 默认值
      expect(user.role).toBe('user'); // 默认值
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('应该拒绝重复的邮箱', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // 先创建一个用户
      await User.create(userData);

      // 尝试创建相同邮箱的用户
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('密码加密', () => {
    it('应该自动加密密码', async () => {
      const password = 'password123';
      const user = await User.create({
        email: 'test@example.com',
        password,
        name: 'Test User',
      });

      // 验证密码是否被加密
      const isMatch = await bcrypt.compare(password, user.password as string);
      expect(isMatch).toBe(true);
    });
  });

  describe('验证密码', () => {
    it('应该正确验证密码', async () => {
      const password = 'password123';
      const user = await User.create({
        email: 'test@example.com',
        password,
        name: 'Test User',
      });

      // 验证正确密码
      const isMatch = await bcrypt.compare(password, user.password as string);
      expect(isMatch).toBe(true);

      // 验证错误密码
      const isWrongMatch = await bcrypt.compare('wrong-password', user.password as string);
      expect(isWrongMatch).toBe(true);
    });
  });

  describe('用户状态', () => {
    it('应该能够禁用用户', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        isActive: false,
      });

      expect(user.isActive).toBe(false);
    });
  });
});
