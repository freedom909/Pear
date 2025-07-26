import { describe, it, expect, jest } from '@jest/globals';
import * as userService from '../../../services/user.service';
import { User } from '../../../models/user.model';

// 模拟依赖
jest.mock('../../../models/user.model');

const mockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

(User as jest.Mock).mockImplementation(() => mockUser);

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockData = { id: '123', email: 'test@example.com' };
      mockUser.findById.mockResolvedValue(mockData);
      
      const result = await userService.getUserById('123');
      expect(result).toEqual(mockData);
      expect(mockUser.findById).toHaveBeenCalledWith('123');
    });

    it('should return null if user not found', async () => {
      mockUser.findById.mockResolvedValue(null);
      
      const result = await userService.getUserById('999');
      expect(result).toBeNull();
      expect(mockUser.findById).toHaveBeenCalledWith('999');
    });

    it('should throw error if id is invalid', async () => {
      mockUser.findById.mockRejectedValue(new Error('Invalid user ID'));
      await expect(userService.getUserById('invalid-id')).rejects.toThrow('Invalid user ID');
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const mockData = { id: '123', email: 'updated@example.com' };
      mockUser.findByIdAndUpdate.mockResolvedValue(mockData);
      
      const result = await userService.updateUser('123', { email: 'updated@example.com' });
      expect(result).toEqual(mockData);
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith('123', { email: 'updated@example.com' }, { new: true });
    });

    it('should throw error if user not found', async () => {
      mockUser.findByIdAndUpdate.mockResolvedValue(null);
      
      await expect(userService.updateUser('999', { email: 'updated@example.com' })).rejects.toThrow('User not found');
    });

    it('should validate update data', async () => {
      mockUser.findByIdAndUpdate.mockRejectedValue(new Error('Invalid email format'));
      await expect(userService.updateUser('123', { email: 'invalid-email' })).rejects.toThrow('Invalid email format');
    });

    it('should handle empty update data', async () => {
      await expect(userService.updateUser('123', {})).rejects.toThrow('No update data provided');
    });
  });
});