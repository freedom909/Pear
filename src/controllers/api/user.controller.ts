import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User';
import { ApiResponse } from '../../utils/api-response.util';

/**
 * User API Controller
 * Handles user-related API requests
 */
export class UserController {
  /**
   * Get current user profile
   * @route GET /api/v1/users/me
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }
      
      return ApiResponse.success(res, user, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * @route PUT /api/v1/users/me
   */
  static async updateCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const { name, email } = req.body;
      
      // Validate input
      if (!name && !email) {
        return ApiResponse.validationError(res, [
          { field: 'name/email', message: 'At least one field must be provided' }
        ]);
      }
      
      // Check if email is already taken
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUser) {
          return ApiResponse.validationError(res, [
            { field: 'email', message: 'Email is already taken' }
          ]);
        }
      }
      
      // Update user
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      return ApiResponse.success(res, updatedUser, 'User profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * @route GET /api/v1/users/:id
   */
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }
      
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List users (admin only)
   * @route GET /api/v1/users
   */
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      const total = await User.countDocuments();
      const users = await User.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const pagination = ApiResponse.getPaginationMeta(total, page, limit);
      
      return ApiResponse.paginated(res, users, pagination, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}