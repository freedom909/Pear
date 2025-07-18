import app from '../../app';
import { connectDB, closeDB } from '../../config/database';
import request from 'supertest';
import { createTestUser, cleanupTestData } from '../utils/testHelpers';

let authToken: string;
let testUserId: string;

beforeAll(async () => {
  await connectDB();
  // Create test user and get auth token
  const testUser = await createTestUser({
    email: 'integration@test.com',
    password: 'test1234',
    name: 'Integration Test User'
  });
  testUserId = testUser._id as unknown as string;
  
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'integration@test.com',
      password: 'test1234'
    });
  authToken = res.body.token;
});

afterAll(async () => {
  await cleanupTestData();
  await closeDB();
});

export const getAuthToken = () => authToken;
export const getTestUserId = () => testUserId;