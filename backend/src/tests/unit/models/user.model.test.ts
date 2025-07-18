import User from '../../../models/user/user.model';
import mongoose from 'mongoose';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';

describe('User Model', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'hashedPassword123!',
    firstname: 'Test',
    lastname: 'User'
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/testdb');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }, 60000); // Increase timeout to 60 seconds

  it('should create and save user successfully', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(testUser.email);
    expect(savedUser.firstname).toBe(testUser.firstname);
    expect(savedUser.lastname).toBe(testUser.lastname);
    expect(savedUser.password).not.toBe(testUser.password);
  });

  it('should fail when required fields are missing', async () => {
    const user = new User({ firstname: 'Incomplete', lastname: 'User' });
    
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail when email is invalid', async () => {
    const user = new User({
      ...testUser,
      email: 'not-an-email'
    });
    
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should automatically set createdAt and updatedAt timestamps', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    expect(savedUser.createdAt).toBeInstanceOf(Date);
    expect(savedUser.updatedAt).toBeInstanceOf(Date);
  });

  it('should hash the password before saving', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    expect(savedUser.password).not.toBe(testUser.password);
    expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should compare passwords correctly', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    const isMatch = await savedUser.comparePassword(testUser.password);
    expect(isMatch).toBe(true);
    
    const isNotMatch = await savedUser.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should generate reset password token', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    const resetToken = savedUser.getResetPasswordToken();
    expect(resetToken).toBeDefined();
    expect(savedUser.passwordResetToken).toBeDefined();
    expect(savedUser.passwordResetExpires).toBeInstanceOf(Date);
  });

  it('should generate JWT token', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    const token = savedUser.getSignedJwtToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should update passwordChangedAt when password is modified', async () => {
    const user = new User(testUser);
    const savedUser = await user.save();
    
    savedUser.password = 'newPassword123!';
    await savedUser.save();
    
    expect(savedUser.passwordChangedAt).toBeInstanceOf(Date);
  });
});