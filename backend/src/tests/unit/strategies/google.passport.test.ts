import { GoogleStrategy } from '../../../strategies/google';
import userService from '../../../services/user.service';
import ErrorCode from '../../../errors/error-code';
import { UserDocument } from '../../../models/user/user.types';
import { AuthProvider } from '../../../models/user/user.types';
import { Request, Response } from 'express';
import { Profile } from 'passport-google-oauth20';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PassportStatic } from 'passport';
import { OAuthConfig } from '../../../models/interface';

// Mock dependencies
jest.mock('../../../services/user.service');
const mockedUserService = userService as jest.Mocked<typeof userService>;

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockDone: jest.Mock;
  let mockPassport: Partial<PassportStatic>;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mock passport
    mockPassport = {
      use: jest.fn(),
      authenticate: jest.fn().mockReturnValue(jest.fn())
    } as Partial<PassportStatic>;
    
    // Create a new instance of GoogleStrategy
    googleStrategy = new GoogleStrategy();
    
    // Initialize the strategy with mock config
    const config: OAuthConfig = {
      provider: 'google',
      clientID: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      callbackURL: 'http://localhost:3000/api/auth/google/callback'
    };
    
    // Initialize the strategy
    googleStrategy.init(mockPassport as PassportStatic, config, mockedUserService);
    
    // Mock the done callback
    mockDone = jest.fn();
  });
  
  describe('validate', () => {
    it('should create and return a new user if user does not exist', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google'
      };
      
      const mockNewUser = {
        _id: 'newuser123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123',
        avatar: 'https://example.com/photo.jpg'
      } as unknown as UserDocument;
      
      mockedUserService.findUserByEmail.mockResolvedValue(null as unknown as UserDocument);
      mockedUserService.findUserByProviderId.mockResolvedValue(null as unknown as UserDocument);
      mockedUserService.createUser.mockResolvedValue(mockNewUser);
      
      // Act
      await googleStrategy.validate(accessToken, refreshToken, profile as Profile, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(profile.emails![0].value);
      expect(mockedUserService.findUserByProviderId).toHaveBeenCalledWith('google123', AuthProvider.GOOGLE);
      expect(mockedUserService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: profile.emails![0].value,
        firstname: 'Test',
        lastname: 'User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123',
        avatar: 'https://example.com/photo.jpg'
      }));
      expect(mockDone).toHaveBeenCalledWith(null, mockNewUser);
    });
    
    it('should return existing user if found by email', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google'
      };
      
      const mockExistingUser = {
        _id: 'existinguser123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123'
      } as unknown as UserDocument;
      
      mockedUserService.findUserByEmail.mockResolvedValue(mockExistingUser);
      
      // Act
      await googleStrategy.validate(accessToken, refreshToken, profile as Profile, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedUserService.findUserByProviderId).not.toHaveBeenCalled();
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(null, mockExistingUser);
    });
    
    it('should return existing user if found by providerId', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google'
      };
      
      const mockExistingUser = {
        _id: 'existinguser123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123'
      } as unknown as UserDocument;
      
      mockedUserService.findUserByEmail.mockResolvedValue(null as unknown as UserDocument);
      mockedUserService.findUserByProviderId.mockResolvedValue(mockExistingUser);
      
      // Act
      await googleStrategy.validate(accessToken, refreshToken, profile as Profile, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedUserService.findUserByProviderId).toHaveBeenCalledWith('google123', AuthProvider.GOOGLE);
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(null, mockExistingUser);
    });
    
    it('should handle profile without email', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [],
        provider: 'google'
      };
      
      // Act
      await googleStrategy.validate(accessToken, refreshToken, profile as Profile, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).not.toHaveBeenCalled();
      expect(mockedUserService.findUserByProviderId).not.toHaveBeenCalled();
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Google OAuth profile is missing email',
          code: ErrorCode.BAD_REQUEST,
        }),
        false
      );
    });
    
    it('should handle unexpected errors', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      const profile: Partial<Profile> = {
        id: 'google123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google'
      };
      
      const error = new Error('Database connection failed');
      mockedUserService.findUserByEmail.mockRejectedValue(error);
      
      // Act
      await googleStrategy.validate(accessToken, refreshToken, profile as Profile, mockDone);
      
      // Assert
      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith(profile.emails![0].value);
      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Google OAuth authentication failed',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        }),
        false
      );
    });
  });
  
  describe('authenticate', () => {
    it('should call passport authenticate with correct options', () => {
      // Arrange
      const mockReq = {} as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn();
      
      // Act
      googleStrategy.authenticate(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockPassport.authenticate).toHaveBeenCalledWith('google', {
        session: false,
        scope: ['profile', 'email']
      }, expect.any(Function));
    });
  });
  
  describe('init', () => {
    it('should throw error if userService is not provided', () => {
      // Arrange
      const strategy = new GoogleStrategy();
      const config: OAuthConfig = {
        provider: 'google',
        clientID: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        callbackURL: 'http://localhost:3000/api/auth/google/callback'
      };
      
      // Act & Assert
      expect(() => {
        strategy.init(mockPassport as PassportStatic, config, null as any);
      }).toThrow('userService is required');
    });
    
    it('should throw error if required methods are missing from userService', () => {
      // Arrange
      const strategy = new GoogleStrategy();
      const config: OAuthConfig = {
        provider: 'google',
        clientID: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        callbackURL: 'http://localhost:3000/api/auth/google/callback'
      };
      const incompleteUserService = {
        findUserByEmail: jest.fn(),
        // Missing findUserByProviderId and createUser
      };
      
      // Act & Assert
      expect(() => {
        strategy.init(mockPassport as PassportStatic, config, incompleteUserService as any);
      }).toThrow('userService.findUserByProviderId must be a function');
    });
    
    it('should throw error if OAuth config is missing required fields', () => {
      // Arrange
      const strategy = new GoogleStrategy();
      const incompleteConfig: OAuthConfig = {
        provider: 'google',
        clientID: '',  // Empty client ID
        clientSecret: 'mock-client-secret',
        callbackURL: 'http://localhost:3000/api/auth/google/callback'
      };
      
      // Act & Assert
      expect(() => {
        strategy.init(mockPassport as PassportStatic, incompleteConfig, mockedUserService);
      }).toThrow('Missing required Google OAuth configuration');
    });
  });
});