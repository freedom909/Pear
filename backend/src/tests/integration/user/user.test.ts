import request from 'supertest';
import app from '../../../app';
import * as db from '../../../config/database';
import User from '../../../models/user/user.model';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';


describe('User API Integration Tests', () => {
  let authToken: string;
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  beforeAll(async () => {
    await db.connectDB();
    // Create test user and get auth token
    await User.create(testUser);
    
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await db.closeDB();
    console.log('disconnect');
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/users');
  });

  describe('GET /users/me', () => {
    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should return 401 without valid token', async () => {
      const response = await request(app)
        .get('/users/me');
      
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update user profile', async () => {
      const updatedData = { name: 'Updated Name' };
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      
      // Verify update in database
      const user = await User.findOne({ email: testUser.email });
      expect(user?.username).toBe(updatedData.name);
    })
    });
      });
    });
