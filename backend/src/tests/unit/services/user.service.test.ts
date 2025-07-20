import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import userService, { CreateUserDTO } from '../../../services/user.service';
import User from '../../../models/user/user.model';
import { AppError } from '../../../errors/appError';
import ErrorCode from '../../../errors/error-code';
import { IUserModel, UserDocument, UserRole } from '../../../models/user/user.types';
import { Profile as PassportProfile } from 'passport';

jest.mock('../../../models/user/user.model');
jest.mock('bcryptjs');

const VALID_ID = new mongoose.Types.ObjectId().toString();

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return a user when a valid ID is provided', async () => {
      const mockUser = { _id: VALID_ID, username: 'testuser' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(VALID_ID);
      expect(result).toEqual(expect.objectContaining({
        id: mockUser._id,
        username: mockUser.username
      }));
      expect(User.findById).toHaveBeenCalledWith(VALID_ID);
    });

    it('should throw an error when user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById(VALID_ID)).rejects.toThrow(AppError);
    });

    it('should throw an error when an invalid ID is provided', async () => {
      const invalidId = 'invalid-id';
      
      await expect(userService.getUserById(invalidId)).rejects.toThrow(AppError);
      expect(User.findById).not.toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user when a valid email is provided', async () => {
      const mockUser = { email: 'test@example.com' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('findUserByProviderId', () => {
    it('should return a user when valid provider and providerId are provided', async () => {
      const mockUser = { provider: 'google', providerId: 'google-id' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findUserByProviderId('google', 'google-id');
      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ 'google.id': 'google-id' });
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockUsers = [{ username: 'user1' }, { username: 'user2' }];
      const mockCount = 10;

      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      });
      (User.countDocuments as jest.Mock).mockResolvedValue(mockCount);

      const result = await userService.getUsers(page, limit);
      expect(result).toEqual(expect.objectContaining({
        users: expect.any(Array),
        pagination: expect.objectContaining({
          total: mockCount,
          page: page,
          limit: limit
        })
      }));
    });
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData: CreateUserDTO = {
        firstname: 'newuser',
        lastname: 'test',
        email: 'newuser@example.com',
        password: 'password123',
        status: 'active',
        verified: true
      };
      const hashedPassword = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.prototype.save as jest.Mock).mockResolvedValue({
        ...userData,
        password: hashedPassword,
        _id: VALID_ID
      });

      const result = await userService.createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it('should throw an error if email already exists', async () => {
      const userData: CreateUserDTO = {
        firstname: 'existinguser',
        lastname: 'test',
        email: 'existing@example.com',
        password: 'password123',
        status: 'active',
        verified: true
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      await expect(userService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('createUserFromOAuthProfile', () => {
    it('should create a new user from OAuth profile', async () => {
      const oauthData = {
        id: 'google-id',
        name: {
          firstname: 'OAuth',
          lastname: 'User'
        },
        emails: [{ value: 'oauth@example.com' }],
        provider: 'google' as 'google',
        isVerified: true,
        avatar: 'https://example.com/avatar.jpg'
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: VALID_ID,
        email: oauthData.emails[0].value,
        provider: oauthData.provider
      });

      const result = await userService.createUserFromOAuthProfile(oauthData);

      expect(User.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        _id: VALID_ID,
        email: oauthData.emails[0].value
      }));
    });
  });

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const updateData = { username: 'updateduser' };
      const updatedUser = { _id: VALID_ID, username: 'updateduser' };

      (User.findById as jest.Mock).mockResolvedValue({ _id: VALID_ID, username: 'olduser' });
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateUser(VALID_ID, updateData);
      expect(result).toEqual(expect.objectContaining({
        id: updatedUser._id
      }));
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user with valid ID', async () => {
      const deletedUser = { _id: VALID_ID };

      (User.findById as jest.Mock).mockResolvedValue(deletedUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedUser);

      await userService.deleteUser(VALID_ID);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID);
    });
  });

  describe('linkOAuthProviderToUser', () => {
    it('should link OAuth provider to existing user', async () => {
      const userId = VALID_ID;
      const provider = 'google';
      const providerId = 'google-id';
      const mockUser = {
        _id: VALID_ID,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue({
          _id: VALID_ID,
          google: { id: 'google-id' }
        } as unknown as never)
      };
      
      const mockProfile = {
        id: providerId,
        displayName: 'Test User',
        provider: provider
      } as unknown as PassportProfile;

      const result = await userService.linkOAuthProviderToUser(
        mockUser as unknown as UserDocument,
        provider,
        providerId,
        mockProfile,
        true
      );

      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        _id: VALID_ID,
        google: { id: 'google-id' }
      }));
    });
  });
});