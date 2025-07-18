import { AuthStrategyFactory } from '../../../strategies/auth.factory';
import { GoogleOAuthStrategy } from '../../../strategies/google';
import { FacebookOAuthStrategy } from '../../../strategies/facebook';
import { TwitterOAuthStrategy } from '../../../strategies/twitter';
import { AppleOAuthStrategy } from '../../../strategies/apple';
import { LocalAuthStrategy } from '../../../strategies/local';
import userService from '../../../services/user.service';
import { OAuthConfig } from '../../../models/interface/index';
import { PassportStatic } from 'passport';
import logger from '../../../middleware/logger';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';


// Mock dependencies
jest.mock('../../../strategies/google');
jest.mock('../../../strategies/facebook');
jest.mock('../../../strategies/twitter');
jest.mock('../../../strategies/apple');
jest.mock('../../../strategies/local');
jest.mock('../../../services/user.service');
jest.mock('../../../middleware/logger');

describe('AuthStrategyFactory', () => {
  let authFactory: AuthStrategyFactory;
  let mockPassport: PassportStatic;
  let mockConfigs: Record<string, OAuthConfig>;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock passport
    mockPassport = {} as PassportStatic;
    
    // Create mock configs
    mockConfigs = {
      google: {
          clientID: 'google-client-id',
          clientSecret: 'google-client-secret',
          callbackURL: 'http://localhost:3000/api/auth/google/callback',
          provider: ''
      },
      facebook: {
          clientID: 'facebook-client-id',
          clientSecret: 'facebook-client-secret',
          callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
          provider: ''
      },
      twitter: {
          clientID: 'twitter-client-id',
          clientSecret: 'twitter-client-secret',
          callbackURL: 'http://localhost:3000/api/auth/twitter/callback',
          provider: ''
      },
      apple: {
          clientID: 'apple-client-id',
          teamID: 'apple-team-id',
          keyID: 'apple-key-id',
          privateKeyLocation: '/path/to/private/key',
          callbackURL: 'http://localhost:3000/api/auth/apple/callback',
          provider: '',
          clientSecret: ''
      }
    };
    
    // Create auth factory instance
    authFactory = new AuthStrategyFactory(mockPassport, mockConfigs, userService);
  });
  
  describe('initializeStrategies', () => {
    it('should initialize all strategies with valid configs', () => {
      // Act
      authFactory.initializeStrategies();
      
      // Assert
      expect(GoogleOAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        mockConfigs.google,
        userService
      );
      expect(FacebookOAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        mockConfigs.facebook,
        userService
      );
      expect(TwitterOAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        mockConfigs.twitter,
        userService
      );
      expect(AppleOAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        mockConfigs.apple,
        userService
      );
      expect(LocalAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        {},
        userService
      );
      
      // Verify strategies are stored in the map
      expect(authFactory.hasStrategy('google')).toBe(true);
      expect(authFactory.hasStrategy('facebook')).toBe(true);
      expect(authFactory.hasStrategy('twitter')).toBe(true);
      expect(authFactory.hasStrategy('apple')).toBe(true);
      expect(authFactory.hasStrategy('local')).toBe(true);
      
      // Verify logger calls
      expect(logger.info).toHaveBeenCalledWith('Initializing OAuth strategies');
      expect(logger.info).toHaveBeenCalledWith('Google OAuth strategy initialized');
      expect(logger.info).toHaveBeenCalledWith('Facebook OAuth strategy initialized');
      expect(logger.info).toHaveBeenCalledWith('Twitter OAuth strategy initialized');
      expect(logger.info).toHaveBeenCalledWith('Apple OAuth strategy initialized');
      expect(logger.info).toHaveBeenCalledWith('Local authentication strategy initialized');
      expect(logger.info).toHaveBeenCalledWith('Authentication strategies initialization completed');
    });
    
    it('should skip initializing strategies with incomplete configs', () => {
      // Arrange
   const incompleteConfigs = {
  google: {
    provider: 'google',
    clientID: 'google-client-id',
    clientSecret: '',
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  },
  facebook: {
    provider: 'facebook',
    clientID: '',
    clientSecret: 'facebook-client-secret',
    callbackURL: 'http://localhost:3000/api/auth/facebook/callback'
  },
  twitter: undefined,
  apple: {
    provider: 'apple',
    clientID: 'apple-client-id',
    clientSecret: '',
    callbackURL: 'http://localhost:3000/api/auth/apple/callback',
    teamID: 'apple-team-id',
    keyID: '',
    privateKeyLocation: ''
  }
};

      
      authFactory = new AuthStrategyFactory(mockPassport, { ...incompleteConfigs, twitter: {} } as unknown as Record<string, OAuthConfig>, userService);
      
      // Act
      authFactory.initializeStrategies();
      
      // Assert
      expect(GoogleOAuthStrategy.prototype.init).not.toHaveBeenCalled();
      expect(FacebookOAuthStrategy.prototype.init).not.toHaveBeenCalled();
      expect(TwitterOAuthStrategy.prototype.init).not.toHaveBeenCalled();
      expect(AppleOAuthStrategy.prototype.init).not.toHaveBeenCalled();
      expect(LocalAuthStrategy.prototype.init).toHaveBeenCalledWith(
        mockPassport,
        {},
        userService
      );
      
      // Verify strategies are not stored in the map
      expect(authFactory.hasStrategy('google')).toBe(false);
      expect(authFactory.hasStrategy('facebook')).toBe(false);
      expect(authFactory.hasStrategy('twitter')).toBe(false);
      expect(authFactory.hasStrategy('apple')).toBe(false);
      expect(authFactory.hasStrategy('local')).toBe(true); // Local strategy is always initialized
      
      // Verify logger calls for warnings
      expect(logger.warn).toHaveBeenCalledWith('Apple OAuth configuration incomplete, skipping initialization');
    });
    
    it('should handle errors during Apple strategy initialization', () => {
      // Arrange
      const mockError = new Error('Apple initialization error');
      (AppleOAuthStrategy.prototype.init as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      // Act
      authFactory.initializeStrategies();
      
      // Assert
      expect(AppleOAuthStrategy.prototype.init).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error initializing Apple OAuth strategy', { error: mockError });
      expect(authFactory.hasStrategy('apple')).toBe(false);
    });
    
    it('should handle general initialization errors', () => {
      // Arrange
      const mockError = new Error('General initialization error');
      (GoogleOAuthStrategy.prototype.init as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      // Act & Assert
      expect(() => authFactory.initializeStrategies()).toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error initializing OAuth strategies', { error: mockError });
    });
  });
  
  describe('getStrategy', () => {
    beforeEach(() => {
      // Initialize strategies before testing getStrategy
      authFactory.initializeStrategies();
    });
    
    it('should return the requested strategy if it exists', () => {
      // Arrange
      const mockGoogleStrategy = new GoogleOAuthStrategy();
      (authFactory as any).strategies.set('google', mockGoogleStrategy);
      
      // Act
      const strategy = authFactory.getStrategy('google');
      
      // Assert
      expect(strategy).toBe(mockGoogleStrategy);
    });
    
    it('should throw an error if the requested strategy does not exist', () => {
      // Act & Assert
      expect(() => authFactory.getStrategy('unknown')).toThrow('Strategy not found for provider: unknown');
    });
  });
  
  describe('getStrategies', () => {
    it('should return all initialized strategies', () => {
      // Arrange
      authFactory.initializeStrategies();
      
      // Act
      const strategies = authFactory.getStrategies();
      
      // Assert
      expect(strategies).toBeInstanceOf(Map);
      expect(strategies.size).toBe(5); // google, facebook, twitter, apple, local
      expect(strategies.has('google')).toBe(true);
      expect(strategies.has('facebook')).toBe(true);
      expect(strategies.has('twitter')).toBe(true);
      expect(strategies.has('apple')).toBe(true);
      expect(strategies.has('local')).toBe(true);
    });
  });
  
  describe('hasStrategy', () => {
    beforeEach(() => {
      // Initialize strategies before testing hasStrategy
      authFactory.initializeStrategies();
    });
    
    it('should return true if the strategy exists', () => {
      // Act & Assert
      expect(authFactory.hasStrategy('google')).toBe(true);
      expect(authFactory.hasStrategy('facebook')).toBe(true);
      expect(authFactory.hasStrategy('twitter')).toBe(true);
      expect(authFactory.hasStrategy('apple')).toBe(true);
      expect(authFactory.hasStrategy('local')).toBe(true);
    });
    
    it('should return false if the strategy does not exist', () => {
      // Act & Assert
      expect(authFactory.hasStrategy('unknown')).toBe(false);
    });
  });
  
  describe('removeStrategy', () => {
    beforeEach(() => {
      // Initialize strategies before testing removeStrategy
      authFactory.initializeStrategies();
    });
    
    it('should remove the specified strategy', () => {
      // Arrange
      expect(authFactory.hasStrategy('google')).toBe(true);
      
      // Act
      authFactory.removeStrategy('google');
      
      // Assert
      expect(authFactory.hasStrategy('google')).toBe(false);
    });
    
    it('should not throw an error if the strategy does not exist', () => {
      // Act & Assert
      expect(() => authFactory.removeStrategy('unknown')).not.toThrow();
    });
  });
});