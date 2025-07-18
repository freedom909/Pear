import { signToken, verifyToken } from '../../../utils/jwt';
import jwt from 'jsonwebtoken'; 
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('jsonwebtoken');
jest.mock('../../../config/config', () => ({
  jwt: {
    secret: 'test-secret',
    expiresIn: '90d'
  }
}));

describe('JWT Utilities', () => {
  const mockPayload = { id: 'user123', email: 'test@example.com' };
  const mockToken = 'mock.jwt.token';
  const mockSecret = 'test-secret';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    it('should generate valid JWT token', () => {
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      const result = signToken(mockPayload);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        mockSecret,
        { expiresIn: '90d' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid JWT token', () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = verifyToken(mockToken);
      
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(() => verifyToken('invalid.token')).toThrow();
    });
  });
});