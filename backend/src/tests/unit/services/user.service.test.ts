import { getUserProfile } from '../../../services/user.service';
import User from '../../../models/user/user.model';

// Mock the User model
jest.mock('../../../models/user/user.model');

describe('User Service Unit Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      // Mock User.findById
      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getUserProfile('507f1f77bcf86cd799439011');
      
      expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({
        email: mockUser.email,
        name: mockUser.name
      });
    });

    it('should throw error when user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValueOnce(null);
      
      await expect(getUserProfile('invalid-id'))
        .rejects
        .toThrow('User not found');
    });
  });
});