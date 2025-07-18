import { 
  hashPassword, 
  comparePassword 
} from '../../../services/password.service';
import bcrypt from 'bcryptjs';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
jest.mock('bcryptjs');

describe('Password Service', () => {
  const testPassword = 'testPassword123';
  const testHash = 'hashedPassword123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(testHash);

      const result = await hashPassword(testPassword);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(testPassword, 12);
      expect(result).toBe(testHash);
    });

    it('should throw error when hashing fails', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(
        new Error('Hashing failed')
      );
      
      await expect(hashPassword(testPassword)).rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await comparePassword(testPassword, testHash);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, testHash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await comparePassword('wrongPassword', testHash);
      
      expect(result).toBe(false);
    });

    it('should throw error when comparison fails', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(
        new Error('Comparison failed')
      );
      
      await expect(comparePassword(testPassword, testHash)).rejects.toThrow();
    });
  });
});