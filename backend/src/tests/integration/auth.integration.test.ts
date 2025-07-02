import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import User from '../../models/user/user.model';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Integration Tests', () => {
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

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.name).toBe('Test User');
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('有效的电子邮件地址');
    });

    it('应该拒绝过短的密码', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('至少包含8个字符');
    });

    it('应该拒绝重复的邮箱', async () => {
      // 先创建一个用户
      await User.create({
        email: 'test@example.com',
        password: await hash('password123', 10),
        name: 'Existing User',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('已被注册');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 创建一个测试用户
      await User.create({
        email: 'test@example.com',
        password: await hash('password123', 10),
        name: 'Test User',
      });
    });

    it('应该成功登录', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('用户不存在');
    });
  });

  describe('GET /api/auth/me', () => {
    it('应该返回当前用户信息', async () => {
      // 创建一个测试用户
      const user = await User.create({
        email: 'test@example.com',
        password: await hash('password123', 10),
        name: 'Test User',
      });

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || '',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('应该拒绝未认证的请求', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('未认证');
    });
  });
});
