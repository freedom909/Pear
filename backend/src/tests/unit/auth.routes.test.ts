import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import authRoutes from '../../routes/auth.routes';
import * as authService from '../../services/auth.service';

// 模拟 authService
jest.mock('../../services/auth.service');

describe('Auth Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    
    // 重置所有模拟
    jest.clearAllMocks();
  });
  
  describe('POST /auth/login', () => {
    it('should return 200 and token on successful login', async () => {
      // 模拟服务返回
      (authService.login as jest.Mock).mockResolvedValue({ token: 'test-token' });
      
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);
      
      expect(response.body).toEqual({ token: 'test-token' });
    });
    
    it('should return 401 on invalid credentials', async () => {
      // 模拟服务抛出错误
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
      
      await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' })
        .expect(401);
    });
  });
  
  describe('POST /auth/register', () => {
    it('should return 201 on successful registration', async () => {
      // 模拟服务返回
      (authService.register as jest.Mock).mockResolvedValue({ id: '123' });
      
      await request(app)
        .post('/auth/register')
        .send({ 
          email: 'new@example.com', 
          password: 'password123',
          firstname: 'Test',
          lastname: 'User'
        })
        .expect(201);
    });
  });
});