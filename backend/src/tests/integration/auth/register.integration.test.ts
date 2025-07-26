import request from 'supertest';
import app from '../../../../src/app';
import { connectDB, disconnectDB } from '../../../src/config/db';
import User from '../../../../src/models/user/user.model';

describe('POST /api/v1/auth/register', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).toBeDefined();
    expect(user?.firstname).toBe('Test');
  });

  it('should return 400 if email is already registered', async () => {
    await User.create({
      firstname: 'Existing',
      lastname: 'User',
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      })
      .expect(400);

    expect(response.body.message).toContain('邮箱已被注册');
  });

  it('should return 400 if passwords do not match', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'different',
      })
      .expect(400);

    expect(response.body.message).toContain('Passwords do not match');
  });
});