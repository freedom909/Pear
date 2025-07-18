import request from 'supertest';
import app from '../../app';
import User from '../../models/user/user.model';

export const createTestUser = async (userData: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);
  
  if (res.status !== 201) {
    throw new Error(`Failed to create test user: ${res.body.message}`);
  }

  return {
    ...res.body.user,
    token: res.body.token
  };
};

export const deleteTestUser = async (userId: string) => {
  await User.findByIdAndDelete(userId);
};

export const getAuthenticatedRequest = async (token: string) => {
  return request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${token}`);
};

export const waitForDatabase = async (maxRetries = 5, delay = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await User.findOne();
      return;
    } catch (err) {
      retries++;
      if (retries >= maxRetries) {
        throw new Error('Database connection failed after retries');
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};