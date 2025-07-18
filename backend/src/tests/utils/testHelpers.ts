import mongoose from 'mongoose';
import User from '../../models/user/user.model';
import type { UserDocument } from '../../models/user/user.types';
import { signToken } from '../../utils/jwt';
// Import supertest properly
import supertest from 'supertest';

type TestUser = {
  email: string;
  password: string;
  name: string;
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (userData: TestUser) => {
  return await User.create(userData);
};

/**
 * Generate an authentication token for a user
 */
export const getAuthToken = async (userData: TestUser) => {
  const user: UserDocument | null = await User.findOne({ email: userData.email });
  if (!user) throw new Error('Test user not found');
  
  return signToken({ 
    id: (user._id as mongoose.Types.ObjectId).toString(), 
    email: user.email
  });
};

/**
 * Login a user and return the auth token
 */
export const loginTestUser = async (app: any, userData: { email: string; password: string }) => {
  const response = await supertest(app)
    .post('/auth/login')
    .send(userData);
  
  return response.body.token;
};

/**
 * Clean up test data after tests
 */
export const cleanupTestData = async () => {
  await User.deleteMany({});
};

/**
 * Create a mock request object for unit tests
 */
export const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  };
};

/**
 * Create a mock response object for unit tests
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};