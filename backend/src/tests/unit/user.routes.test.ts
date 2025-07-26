import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import userRoutes from '../../routes/user.routes';
import * as userService from '../../services/user.service';

// 模拟 userService
jest.mock('../../services/user.service');

describe('User Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
    
    // 重置所有模拟
    jest.clearAllMocks();
  });
  
  describe('GET /users/:id', () => {
    it('should return 200 and user data', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      
      const response = await request(app)
        .get('/users/123')
        .expect(200);
      
      expect(response.body).toEqual(mockUser);
    });
    
    it('should return 404 when user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      
      await request(app)
        .get('/users/999')
        .expect(404);
    });
  });
  
  describe('PUT /users/:id', () => {
    it('should return 200 on successful update', async () => {
      const updatedUser = { id: '123', email: 'updated@example.com' };
      (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      
      const response = await request(app)
        .put('/users/123')
        .send({ email: 'updated@example.com' })
        .expect(200);
      
      expect(response.body).toEqual(updatedUser);
    });
  });
});