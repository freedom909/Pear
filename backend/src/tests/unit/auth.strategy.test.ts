import { AuthStrategyFactory } from '../../strategies/auth.factory';
import passport from 'passport';
import { OAuthConfiguration } from '../../config/oauth';
import  UserService  from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

describe('AuthStrategyFactory', () => {
  let factory: AuthStrategyFactory;
  const oauthConfigs = OAuthConfiguration.getConfigs();
  const mockUserService = {} as UserService;
  const mockUserRepository = {} as UserRepository;

  beforeEach(() => {
    factory = new AuthStrategyFactory(passport, oauthConfigs, mockUserService, mockUserRepository);
  });

  it('should initialize Google strategy', () => {
    const spy = jest.spyOn(passport, 'use');
    factory.initializeStrategies();
    expect(spy).toHaveBeenCalledWith('google', expect.anything());
  });

  it('should initialize Facebook strategy', () => {
    const spy = jest.spyOn(passport, 'use');
    factory.initializeStrategies();
    expect(spy).toHaveBeenCalledWith('facebook', expect.anything());
  });
});