import request from 'supertest';
import app from '../../app';
import { setupSessionSerialization } from '../../strategies/session';
import { AuthStrategyFactory } from '../../strategies/auth.factory';
import passport from 'passport';
import { OAuthConfiguration } from '../../config/oauth';
import  UserService  from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import {expect, describe, beforeAll, it} from '@jest/globals';


const oauthConfigs = OAuthConfiguration.getConfigs();
const mockUserService = {} as UserService;
const mockUserRepository = {} as UserRepository;

beforeAll(() => {
  setupSessionSerialization();
  const factory = new AuthStrategyFactory(passport, oauthConfigs, mockUserService, mockUserRepository);
  factory.initializeStrategies();
});

describe('OAuth Integration Tests', () => {
  it('should redirect to Google OAuth', async () => {
    const response = await request(app).get('/api/v1/auth/google');
    expect(response.status).toBe(302);
    expect(response.header.location).toContain('accounts.google.com');
  });

  it('should redirect to Facebook OAuth', async () => {
    const response = await request(app).get('/api/v1/auth/facebook');
    expect(response.status).toBe(302);
    expect(response.header.location).toContain('facebook.com');
  });
});