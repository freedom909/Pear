import { Request, Response, NextFunction } from 'express';
import  User from '../../models/user/user.model';
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
  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Unauthorized');
      }

      const user = await User.findById((req as any).user.id).select('-password');
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }
      
      return ApiResponse.success(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * @route PUT /api/v1/users/me
   */
  static async updateCurrentUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Unauthorized');
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
        const existingUser = await User.findOne({ email, _id: { $ne: (req as any).user.id } });
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
        (req as any).user.id,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      return ApiResponse.success(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * @route GET /api/v1/users/:id
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }
      
      return ApiResponse.success(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List users (admin only)
   * @route GET /api/v1/users
   */
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
      
      ApiResponse.getPaginationMeta(page, limit, total);
      
      return ApiResponse.paginated(res, users, page, limit, total, 200);
    } catch (error) {
      next(error);
    }
  }
}