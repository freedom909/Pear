import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { BadRequestError, ErrorCode } from '../config/error.config';
import { UserRole, UserStatus } from '../models';

/**
 * User controller
 */
export class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const user = await userService.findUserById(userId);
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, avatar } = req.body;
      
      const user = await userService.updateUser(userId, {
        firstName,
        lastName,
        avatar
      });
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      await userService.changePassword(userId, currentPassword, newPassword);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await userService.findUserById(id);
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users list (Admin only)
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, sort, search } = req.query;
      
      const users = await userService.findUsers({
        page: Number(page),
        limit: Number(limit),
        sort: sort as string,
        search: search as string
      });
      
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, status, verified } = req.body;
      
      // Validate role update
      if (role && !Object.values(UserRole).includes(role)) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid role'
        );
      }
      
      // Validate status update
      if (status && !Object.values(UserStatus).includes(status)) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid status'
        );
      }
      
      const user = await userService.updateUser(id, {
        firstName,
        lastName,
        role,
        status,
        verified
      });
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await userService.deleteUser(id);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const userController = new UserController();