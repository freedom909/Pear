import { GoogleOAuthStrategy as GoogleStrategy } from '../../../strategies/google';
import { UserDocument } from '../../../models/user/user.types';
import { AuthProvider } from '../../../models/user/user.types';
import { ErrorCode } from '../../../errors/error-code';


describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockedUserService: {
    findUserByEmail: jest.Mock<Promise<UserDocument | null>, [string]>;
    findUserByProviderId: jest.Mock<Promise<UserDocument | null>, [string, AuthProvider]>;
    createUser: jest.Mock<Promise<UserDocument>, [any]>;
    comparePassword: jest.Mock;
    getResetPasswordToken: jest.Mock;
  };
  let mockDone: jest.Mock;

  beforeEach(() => {
    mockedUserService = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
      findUserByProviderId: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({
        id: 'newuser',
        email: 'test@example.com'
      } as UserDocument),
      comparePassword: jest.fn(),
      getResetPasswordToken: jest.fn()
    };
    mockDone = jest.fn();
    googleStrategy = new GoogleStrategy();
  });

  describe('validate', () => {
    it('should create and return a new user if user does not exist', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      await googleStrategy.validate({}, 'accessToken', 'refreshToken', profile, mockDone);

      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedUserService.findUserByProviderId).toHaveBeenCalledWith(
        'google123',
        AuthProvider.GOOGLE
      );
      expect(mockedUserService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        provider: AuthProvider.GOOGLE,
        providerId: 'google123'
      });
      expect(mockDone).toHaveBeenCalledWith(null, {
        id: 'newuser',
        email: 'test@example.com'
      });
    });

    it('should handle profile without email', async () => {
      const profile = {
        id: 'google123',
        displayName: 'Test User'
      };

      await googleStrategy.validate({}, 'accessToken', 'refreshToken', profile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Google OAuth profile is missing email',
          code: ErrorCode.BAD_REQUEST
        })
      );
    });
  });
});

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockedUserService: {
    findUserByEmail: jest.Mock;
    findUserByProviderId: jest.Mock;
    createUser: jest.Mock;
    comparePassword: jest.Mock;
    getResetPasswordToken: jest.Mock;
  };
  let mockDone: jest.Mock;

  beforeEach(() => {
    mockedUserService = {
      findUserByEmail: jest.fn(),
      findUserByProviderId: jest.fn(),
      createUser: jest.fn(),
      comparePassword: jest.fn(),
      getResetPasswordToken: jest.fn()
    };
    mockDone = jest.fn();
    googleStrategy = new GoogleStrategy();
  });

  describe('validate', () => {
    it('should create and return a new user if user does not exist', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      mockedUserService.findUserByEmail.mockResolvedValue(null);
      mockedUserService.findUserByProviderId.mockResolvedValue(null);
      mockedUserService.createUser.mockResolvedValue({
        id: 'newuser',
        email: 'test@example.com'
      })as unknown as UserDocument;

      await googleStrategy.validate({}, 'accessToken', 'refreshToken', profile, mockDone);

      expect(mockedUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedUserService.findUserByProviderId).toHaveBeenCalledWith(
        'google123',
        AuthProvider.GOOGLE
      );
      expect(mockedUserService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        provider: AuthProvider.google,
        providerId: 'google123'
      });
      expect(mockDone).toHaveBeenCalledWith(null, {
        id: 'newuser',
        email: 'test@example.com'
      });
    });

    it('should handle profile without email', async () => {
      const profile = {
        id: 'google123',
        displayName: 'Test User'
      };

      await googleStrategy.validate({}, 'accessToken', 'refreshToken', profile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Google OAuth profile is missing email',
          code: ErrorCode.BAD_REQUEST
        })
      );
    });
  });
});
import userService from '../../../services/user.service';
import { Request, Response } from 'express';
import { Profile } from 'passport-google-oauth20';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../services/user.service');
const mockedUserService = {
  findUserByEmail: jest.fn(),
  findUserByProviderId: jest.fn(),
  createUser: jest.fn(),
  comparePassword: jest.fn(),
  getResetPasswordToken: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
} as unknown as jest.Mocked<typeof userService>;

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let mockDone: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of GoogleStrategy with mock config
    process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';
    
    googleStrategy = new GoogleStrategy();
    
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
          message: '谷歌账号未提供邮箱',
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
          message: '谷歌登录失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: error,
        }),
        false
      );
    });
  });
  
  describe('authenticate', () => {
    it('should call passport authenticate with correct options', () => {
      // Arrange
      const mockReq = {} as Request;
      const mockNext = jest.fn();
      const mockPassport = {
        authenticate: jest.fn().mockReturnValue(jest.fn()),
      };
      
      // Mock the passport instance
      (googleStrategy as any).passport = mockPassport;
      
      // Act
      googleStrategy.authenticate(mockReq, {} as Response, mockNext);
      
      // Assert
      expect(mockPassport.authenticate).toHaveBeenCalledWith('google', {
        session: false,
        scope: ['profile', 'email']
      }, expect.any(Function));
    });
  });
});