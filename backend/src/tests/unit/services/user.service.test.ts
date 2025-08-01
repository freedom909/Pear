import "reflect-metadata"
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import * as userService from '../../../services/user.service';
import { UserDocument } from '../../../models/user/user.types';
  import { UpdateUserDTO } from '../../../dtos/userDTO';
import User from '../../../models/user/user.model';

jest.mock('../../../repositories/user.repository', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// 模拟依赖
jest.mock('../../../models/user/user.model');

const mockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

( User as any).mockImplementation(() => mockUser);

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockData = { id: '123', email: 'test@example.com' };
      mockUser.findById.mockResolvedValue(mockData as UserDocument as never);
      
      const result = await userService.getUserById('123');
      expect(result).toEqual(mockData);
      expect(mockUser.findById).toHaveBeenCalledWith('123');
    });

    it('should return null if user not found', async () => {
      mockUser.findById.mockResolvedValue(null as never);
      
      const result = await userService.getUserById('999');
      expect(result).toBeNull();
      expect(mockUser.findById).toHaveBeenCalledWith('999');
    });

    it('should throw error if id is invalid', async () => {
      mockUser.findById.mockRejectedValue(new Error('Invalid user ID') as never);
      await expect(userService.getUserById('invalid-id')).rejects.toThrow('Invalid user ID');
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const mockData = { id: '123', email: 'updated@example.com' };
      mockUser.findByIdAndUpdate.mockResolvedValue(mockData as never);
      
      const result = await userService.updateUser('123', { email: 'updated@example.com' } as UpdateUserDTO);
      expect(result).toEqual(mockData);
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith('123', { email: 'updated@example.com' }, { new: true });
    });

    it('should throw error if user not found', async () => {
      mockUser.findByIdAndUpdate.mockResolvedValue(null as never);
      
      await expect(userService.updateUser('999', { email: 'updated@example.com' } as UpdateUserDTO)).rejects.toThrow('User not found');
    });

    it('should validate update data', async () => {
      mockUser.findByIdAndUpdate.mockRejectedValue(new Error('Invalid email format') as never);
      await expect(userService.updateUser('123', { email: 'invalid-email' })).rejects.toThrow('Invalid email format');
    });

    it('should handle empty update data', async () => {
      // Ensure the updateUser function exists in the service
      if ('updateUser' in userService) {
        await expect((userService as any).updateUser('123', {})).rejects.toThrow('No update data provided');
      } else {
        throw new Error('updateUser function does not exist in userService');
      }
    });
  });
});