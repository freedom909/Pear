import { 
  getCurrentUser,
  updateCurrentUser
} from '../../../controllers/user.controller';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../errors/appError';
import User from '../../../models/user/user.model';
import { jest,describe,it,expect,beforeEach } from '@jest/globals';

jest.mock('../../../models/user/user.model');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const testUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      email: 'test@example.com',
      name: 'Test User'
    })
  };

  beforeEach(() => {
    mockRequest = {
      user: { id: 'user123' },
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as any,
      json: jest.fn() as unknown as any
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      (User.findById as jest.Mock).mockResolvedValueOnce(testUser as unknown as never);

      await getCurrentUser(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      });
    });

    it('should throw error when user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValueOnce(null as unknown as never);

      await getCurrentUser(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'User not found'
        })
      );
    });
  });

  describe('updateCurrentUser', () => {
    it('should update and return user', async () => {
      const updatedUser = {
        ...testUser,
        name: 'Updated Name',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          name: 'Updated Name'
        })
      };
      
      mockRequest.body = { name: 'Updated Name' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedUser as unknown as never);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { name: 'Updated Name' },
        { new: true, runValidators: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: 'user123',
        email: 'test@example.com',
        name: 'Updated Name'
      });
    });

    it('should throw error when update fails', async () => {
      mockRequest.body = { name: 'Updated Name' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null as unknown as never);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Failed to update user'
        })
      );
    });
  });
});