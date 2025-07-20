import {Token} from '../../../models/token.model';
import mongoose from 'mongoose';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
describe('Token Model', () => {
  const testToken = {
    token: 'test-refresh-token',
    user: new mongoose.Types.ObjectId(),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/testdb');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create and save token successfully', async () => {
    const token = new Token(testToken);
    const savedToken = await token.save();

    expect(savedToken._id).toBeDefined();
    expect(savedToken.token).toBe(testToken.token);
    expect(savedToken.get('user')).toEqual(testToken.user);
    expect(savedToken.get('expires')).toEqual(testToken.expires);
  });

  it('should fail when required fields are missing', async () => {
    const token = new Token({ user: testToken.user });
    
    await expect(token.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should automatically set createdAt timestamp', async () => {
    const token = new Token(testToken);
    const savedToken = await token.save();
    
    expect(savedToken.get('createdAt')).toBeDefined();
  });

  it('should create index for token field', async () => {
    const indexes = await Token.collection.indexInformation();
    expect(indexes).toHaveProperty('token_1');
  });
});