import { AppleOAuthStrategy } from '../../../strategies/apple';
import { PassportStatic } from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import { UserService } from '../../../services/user.service';
import { OAuthConfig } from '../../../models/interface/index';
import logger from '../../../middleware/logger';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { UserDocument } from '../../../models/user/user.types';

// Mock dependencies
jest.mock('passport-apple');
jest.mock('../../../services/user.service');
jest.mock('../../../middleware/logger');

describe('AppleOAuthStrategy', () => {
  let appleStrategy: AppleOAuthStrategy;
  let mockPassport: PassportStatic;
  let mockUserService: jest.Mocked<UserService>;
  let mockConfig: OAuthConfig;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock passport
    mockPassport = {
      use: jest.fn()
    } as unknown as PassportStatic;
    
    // Create mock user service
    mockUserService = {
      findOne: jest.fn(),
      findUserByEmail: jest.fn(),
      linkOAuthProviderToUser: jest.fn(),
      createUserFromOAuthProfile: jest.fn()
    } as unknown as jest.Mocked<UserService>;
    
    // Create mock config
    mockConfig = {
      provider: 'apple',
      clientSecret: 'test-client-secret',
      clientID: 'test-client-id',
      teamID: 'test-team-id',
      keyID: 'test-key-id',
      privateKeyLocation: '/path/to/private/key',
      callbackURL: 'http://localhost:3000/api/auth/apple/callback'
    };
    
    // Create strategy instance
    appleStrategy = new AppleOAuthStrategy();
  });
  
  describe('init', () => {
    it('should initialize the Apple OAuth strategy with passport', () => {
      // Act
      appleStrategy.init(mockPassport, mockConfig, mockUserService);
      
      // Assert
      expect(mockPassport.use).toHaveBeenCalledTimes(1);
      expect(AppleStrategy).toHaveBeenCalledWith(
        {
          clientID: mockConfig.clientID,
          teamID: mockConfig.teamID,
          keyID: mockConfig.keyID,
          privateKeyLocation: mockConfig.privateKeyLocation,
          callbackURL: mockConfig.callbackURL,
          scope: ['email', 'name'],
          passReqToCallback: true,
        },
        expect.any(Function)
      );
      expect(logger.info).toHaveBeenCalledWith('Initializing Apple OAuth strategy');
    });
    
    it('should handle missing config values', () => {
      // Arrange
      const incompleteConfig = {} as OAuthConfig;
      
      // Act
      appleStrategy.init(mockPassport, incompleteConfig, mockUserService);
      
      // Assert
      expect(mockPassport.use).toHaveBeenCalledTimes(1);
      expect(AppleStrategy).toHaveBeenCalledWith(
        {
          clientID: '',
          teamID: '',
          keyID: '',
          privateKeyLocation: '',
          callbackURL: '',
          scope: ['email', 'name'],
          passReqToCallback: true,
        },
        expect.any(Function)
      );
    });
  });
  
  describe('verify callback', () => {
    let verifyCallback: Function;
    let mockDone: jest.Mock;
    let mockProfile: any;
    let mockIdToken: string;
    
    beforeEach(() => {
      // Initialize strategy to capture the verify callback
      appleStrategy.init(mockPassport, mockConfig, mockUserService);
      
      // Extract the verify callback that was passed to AppleStrategy
      verifyCallback = (AppleStrategy as unknown as jest.Mock).mock.calls[0][1] as unknown as Function;
      
      // Create mock done callback
      mockDone = jest.fn();
      
      // Create mock profile.mock.calls[0][1] as Function;
      
      // Create mock done callback
      mockDone = jest.fn();
      
      // Create mock profile
      mockProfile = {
        id: 'apple-user-id',
        emails: [{ value: 'test@example.com' }],
        name: {
          firstname: 'Test',
          lastname: 'User'
        },
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };
      
      // Create mock ID token
      mockIdToken = 'mock-id-token';
    });
    
    it('should find existing user by Apple ID', async () => {
      // Arrange
      const mockUser = { _id: 'user-id', save: jest.fn() };
      mockUserService.findOne.mockResolvedValueOnce(mockUser as unknown as UserDocument);
      
      // Act
      await verifyCallback({}, 'access-token', 'refresh-token', mockIdToken, mockProfile, mockDone);
      
      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith({ 'oauth.apple.id': mockProfile.id });
      expect(mockUserService.findUserByEmail).not.toHaveBeenCalled();
      expect(mockUserService.createUserFromOAuthProfile).not.toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
      expect(logger.debug).toHaveBeenCalledWith(`Apple OAuth callback for profile: ${mockProfile.id}`);
      expect(logger.debug).toHaveBeenCalledWith(`Apple OAuth authentication successful for user: ${mockUser._id}`);
    });
    
    it('should find existing user by email and link Apple account', async () => {
      // Arrange
      const mockUser = { _id: 'user-id', save: jest.fn() };
      mockUserService.findOne.mockResolvedValueOnce(null as unknown as UserDocument);
      mockUserService.findUserByEmail.mockResolvedValueOnce(mockUser as unknown as UserDocument);
      
      // Act
      await verifyCallback({}, 'access-token', 'refresh-token', mockIdToken, mockProfile, mockDone);
      
      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith({ 'oauth.apple.id': mockProfile.id });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(mockProfile.emails[0].value);
      expect(mockUserService.linkOAuthProviderToUser).toHaveBeenCalledWith(
        mockUser,
        'apple',
        mockProfile.id,
        mockProfile,
        false
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUserService.createUserFromOAuthProfile).not.toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });
    
    it('should create new user if no existing user found', async () => {
      // Arrange
      const mockUser = { _id: 'new-user-id' };
      mockUserService.findOne.mockResolvedValueOnce(null as unknown as UserDocument);
      mockUserService.findUserByEmail.mockResolvedValueOnce(null);
      mockUserService.createUserFromOAuthProfile.mockResolvedValueOnce(mockUser as unknown as UserDocument);
      
      // Act
      await verifyCallback({}, 'access-token', 'refresh-token', mockIdToken, mockProfile, mockDone);
      
      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith({ 'oauth.apple.id': mockProfile.id });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(mockProfile.emails[0].value);
      expect(mockUserService.createUserFromOAuthProfile).toHaveBeenCalledWith({
        id: mockProfile.id,
        name: {
          firstname: mockProfile.name.firstname,
          lastname: mockProfile.name.lastname
        },
        emails: mockProfile.emails,
        username: '',
        avatar: mockProfile.photos[0].value,
        provider: 'apple',
        isVerified: false,
        oauth: {
          apple: {
            id: mockProfile.id,
            token: mockIdToken
          }
        }
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });
    
    it('should handle missing profile information when creating new user', async () => {
      // Arrange
      const mockUser = { _id: 'new-user-id' };
      mockUserService.findOne.mockResolvedValueOnce(null as unknown as UserDocument);
      mockUserService.findUserByEmail.mockResolvedValueOnce(null as unknown as UserDocument);
      mockUserService.createUserFromOAuthProfile.mockResolvedValueOnce(mockUser as unknown as UserDocument  );
      
      // Create minimal profile
      const minimalProfile = {
        id: 'apple-user-id',
        // No emails, name, or photos
      };
      
      // Act
      await verifyCallback({}, 'access-token', 'refresh-token', mockIdToken, minimalProfile, mockDone);
      
      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith({ 'oauth.apple.id': minimalProfile.id });
      expect(mockUserService.findUserByEmail).not.toHaveBeenCalled(); // No email to search with
      expect(mockUserService.createUserFromOAuthProfile).toHaveBeenCalledWith({
        id: minimalProfile.id,
        name: {
          firstname: 'Apple', // Default values
          lastname: 'User'
        },
        emails: [],
        username: '',
        avatar: '',
        provider: 'apple',
        isVerified: false,
        oauth: {
          apple: {
            id: minimalProfile.id,
            token: mockIdToken
          }
        }
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });
    
    it('should handle errors during authentication', async () => {
      // Arrange
      const mockError = new Error('Authentication error');
      mockUserService.findOne.mockRejectedValueOnce(mockError);
      
      // Act
      await verifyCallback({}, 'access-token', 'refresh-token', mockIdToken, mockProfile, mockDone);
      
      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith({ 'oauth.apple.id': mockProfile.id });
      expect(mockDone).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalledWith(`Apple OAuth authentication error: ${mockError.message}`, { error: mockError });
    });
  });
});