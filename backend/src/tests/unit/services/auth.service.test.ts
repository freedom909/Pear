import { loginUser } from '../../../services/auth.service';
import User from '../../../models/user/user.model';
import { comparePassword } from '../../../lib/auth';
import { AppError } from '../../../errors/appError';

jest.mock('../../../models/user/user.model');
jest.mock('../../../lib/auth');

describe('Auth Service Unit Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (comparePassword as jest.Mock).mockResolvedValue(true);
  });

  describe('loginUser', () => {
    it('should return user when credentials are valid', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await loginUser('test@example.com', 'password123');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual({
        id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name
      });
    });

    it('should throw error when user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      await expect(loginUser('nonexistent@example.com', 'password123'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error when password is invalid', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);
      
      await expect(loginUser('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(AppError);
    });
  });
});