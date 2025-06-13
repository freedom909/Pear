import { User, IUser, UserRole, UserStatus } from '../models';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ErrorCode 
} from '../config/error.config';
import bcrypt from 'bcryptjs';
import { LoggerConfig } from '../config/logger.config';

/**
 * User filter interface
 */
interface UserFilter {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  verified?: boolean;
  search?: string;
}

/**
 * User query options interface
 */
interface UserQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  select?: string;
}

/**
 * Pagination result interface
 */
interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * User service
 */
export class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if user with email already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new ConflictError(
          ErrorCode.ALREADY_EXISTS,
          'User with this email already exists'
        );
      }
      
      // Create new user
      const user = new User(userData);
      await user.save();
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error creating user', { error });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string, options: { select?: string } = {}): Promise<IUser> {
    try {
      const query = User.findById(id);
      
      // Apply select options
      if (options.select) {
        query.select(options.select);
      }
      
      const user = await query.exec();
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error finding user by ID', { error, id });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string, options: { select?: string } = {}): Promise<IUser | null> {
    try {
      const query = User.findOne({ email });
      
      // Apply select options
      if (options.select) {
        query.select(options.select);
      }
      
      return await query.exec();
    } catch (error) {
      LoggerConfig.error('Error finding user by email', { error, email });
      throw error;
    }
  }

  /**
   * Find user by Google ID
   */
  async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ googleId });
    } catch (error) {
      LoggerConfig.error('Error finding user by Google ID', { error, googleId });
      throw error;
    }
  }

  /**
   * Find users with pagination
   */
  async findUsers(
    filters: UserFilter = {}, 
    options: UserQueryOptions = {}
  ): Promise<PaginationResult<IUser>> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        select
      } = options;
      
      // Build query
      const query: any = {};
      
      // Apply filters
      if (filters.email) {
        query.email = { $regex: filters.email, $options: 'i' };
      }
      
      if (filters.role) {
        query.role = filters.role;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.verified !== undefined) {
        query.verified = filters.verified;
      }
      
      // Search filter (searches in firstName, lastName, and email)
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      // Count total documents
      const total = await User.countDocuments(query);
      
      // Calculate pagination
      const pages = Math.ceil(total / limit);
      const currentPage = page > pages ? pages : page;
      const skip = (currentPage - 1) * limit;
      
      // Execute query
      const userQuery = User.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
      
      // Apply select options
      if (select) {
        userQuery.select(select);
      }
      
      const users = await userQuery.exec();
      
      return {
        data: users,
        pagination: {
          total,
          page: currentPage,
          limit,
          pages
        }
      };
    } catch (error) {
      LoggerConfig.error('Error finding users', { error, filters, options });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if user exists
      const user = await this.findUserById(id);
      
      // Check if email is being updated and if it's already in use
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        
        if (existingUser) {
          throw new ConflictError(
            ErrorCode.ALREADY_EXISTS,
            'Email is already in use'
          );
        }
      }
      
      // Remove sensitive fields that shouldn't be updated directly
      const { password, refreshTokens, role, status, verified, ...safeUpdateData } = updateData;
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: safeUpdateData },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      return updatedUser;
    } catch (error) {
      LoggerConfig.error('Error updating user', { error, id });
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(id: string, role: UserRole): Promise<IUser> {
    try {
      // Check if role is valid
      if (!Object.values(UserRole).includes(role)) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid role'
        );
      }
      
      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { role } },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      return updatedUser;
    } catch (error) {
      LoggerConfig.error('Error updating user role', { error, id, role });
      throw error;
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<IUser> {
    try {
      // Check if status is valid
      if (!Object.values(UserStatus).includes(status)) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid status'
        );
      }
      
      // Update user status
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      return updatedUser;
    } catch (error) {
      LoggerConfig.error('Error updating user status', { error, id, status });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const result = await User.deleteOne({ _id: id });
      
      if (result.deletedCount === 0) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
    } catch (error) {
      LoggerConfig.error('Error deleting user', { error, id });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      // Check if current password is correct
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        throw new BadRequestError(
          ErrorCode.INVALID_CREDENTIALS,
          'Current password is incorrect'
        );
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      // Clear refresh tokens
      await user.clearRefreshTokens();
    } catch (error) {
      LoggerConfig.error('Error changing password', { error, userId });
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();