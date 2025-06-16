import { User, UserDocument, UserRole, UserStatus } from '../models';
import { BadRequestError, NotFoundError, ConflictError, ErrorCode } from '../config/error.config';
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
interface PaginationResult<T> { //does this file related to the server render, is it PUG
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
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        // Return void to prevent email enumeration
        return;
      }

      // Generate reset token
      const resetToken = await user.generatePasswordResetToken();
      await user.save();

      // TODO: Send password reset email with token
      LoggerConfig.info('Password reset requested', { userId: user.id, email });
    } catch (error) {
      LoggerConfig.error('Error requesting password reset', { error, email });
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new BadRequestError(
          ErrorCode.INVALID_TOKEN,
          'Password reset token is invalid or has expired'
        );
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Clear all refresh tokens for security
      await user.clearRefreshTokens();

      LoggerConfig.info('Password reset successful', { userId: user.id });
    } catch (error) {
      LoggerConfig.error('Error resetting password', { error });
      throw error;
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }

      if (user.verified) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Email is already verified'
        );
      }

      // Generate verification token
      const verificationToken = await user.generateEmailVerificationToken();
      await user.save();

      // TODO: Send verification email with token
      LoggerConfig.info('Email verification requested', { userId });
    } catch (error) {
      LoggerConfig.error('Error requesting email verification', { error, userId });
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new BadRequestError(
          ErrorCode.INVALID_TOKEN,
          'Email verification token is invalid or has expired'
        );
      }

      // Update verification status and clear token
      user.verified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      LoggerConfig.info('Email verification successful', { userId: user.id });
    } catch (error) {
      LoggerConfig.error('Error verifying email', { error });
      throw error;
    }
  }
  /**
   * Create a new user
   */
  async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
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
  async findUserById(id: string, options: { select?: string } = {}): Promise<UserDocument> {
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
  async findUserByEmail(email: string, options: { select?: string } = {}): Promise<UserDocument | null> {
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
  async findUserByGoogleId(googleId: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ googleId });
    } catch (error) {
      LoggerConfig.error('Error finding user by Google ID', { error, googleId });
      throw error;
    }
  }

  /**
   * Find user by Facebook ID
   */
  async findUserByFacebookId(facebookId: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ facebookId });
    } catch (error) {
      LoggerConfig.error('Error finding user by Facebook ID', { error, facebookId });
      throw error;
    }
  }

  /**
   * Find user by Twitter ID
   */
  async findUserByTwitterId(twitterId: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ twitterId });
    } catch (error) {
      LoggerConfig.error('Error finding user by Twitter ID', { error, twitterId });
      throw error;
    }
  }

  /**
   * Find user by Apple ID
   */
  async findUserByAppleId(appleId: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ appleId });
    } catch (error) {
      LoggerConfig.error('Error finding user by Apple ID', { error, appleId });
      throw error;
    }
  }

  /**
   * Find user by provider ID (generic method)
   */
  async findUserByProviderId(providerIdField: string, providerId: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ [providerIdField]: providerId });
    } catch (error) {
      LoggerConfig.error('Error finding user by provider ID', { error, providerIdField, providerId });
      throw error;
    }
  }

  /**
   * Find users with pagination
   */
  async findUsers(
    filters: UserFilter = {}, 
    options: UserQueryOptions = {}
  ): Promise<PaginationResult<UserDocument>> {
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
  async updateUser(id: string, updateData: Partial<UserDocument>): Promise<UserDocument> {
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
  async updateUserRole(id: string, role: UserRole): Promise<UserDocument> {
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
  async updateUserStatus(id: string, status: UserStatus): Promise<UserDocument> {
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
   * Create a user with Google OAuth
   */
  async createGoogleUser(userData: Partial<UserDocument>, googleId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Creating Google user', { googleId });
      
      // Create user with Google ID
      const user = new User({
        ...userData,
        googleId,
        verified: true, // OAuth users are considered verified
      });
      
      await user.save();
      LoggerConfig.info('Google user created', { userId: user.id, googleId });
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error creating Google user', { error, googleId });
      throw error;
    }
  }

  /**
   * Create a user with Facebook OAuth
   */
  async createFacebookUser(userData: Partial<UserDocument>, facebookId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Creating Facebook user', { facebookId });
      
      // Create user with Facebook ID
      const user = new User({
        ...userData,
        facebookId,
        verified: true, // OAuth users are considered verified
      });
      
      await user.save();
      LoggerConfig.info('Facebook user created', { userId: user.id, facebookId });
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error creating Facebook user', { error, facebookId });
      throw error;
    }
  }

  /**
   * Create a user with Twitter OAuth
   */
  async createTwitterUser(userData: Partial<UserDocument>, twitterId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Creating Twitter user', { twitterId });
      
      // Create user with Twitter ID
      const user = new User({
        ...userData,
        twitterId,
        verified: true, // OAuth users are considered verified
      });
      
      await user.save();
      LoggerConfig.info('Twitter user created', { userId: user.id, twitterId });
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error creating Twitter user', { error, twitterId });
      throw error;
    }
  }

  /**
   * Create a user with Apple OAuth
   */
  async createAppleUser(userData: Partial<UserDocument>, appleId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Creating Apple user', { appleId });
      
      // Create user with Apple ID
      const user = new User({
        ...userData,
        appleId,
        verified: true, // OAuth users are considered verified
      });
      
      await user.save();
      LoggerConfig.info('Apple user created', { userId: user.id, appleId });
      
      return user;
    } catch (error) {
      LoggerConfig.error('Error creating Apple user', { error, appleId });
      throw error;
    }
  }

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount(userId: string, googleId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Linking Google account to user', { userId, googleId });
      
      // Update user with Google ID
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { googleId } },
        { new: true }
      );
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      LoggerConfig.info('Google account linked to user', { userId, googleId });
      return user;
    } catch (error) {
      LoggerConfig.error('Error linking Google account', { error, userId, googleId });
      throw error;
    }
  }

  /**
   * Link Facebook account to existing user
   */
  async linkFacebookAccount(userId: string, facebookId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Linking Facebook account to user', { userId, facebookId });
      
      // Update user with Facebook ID
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { facebookId } },
        { new: true }
      );
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      LoggerConfig.info('Facebook account linked to user', { userId, facebookId });
      return user;
    } catch (error) {
      LoggerConfig.error('Error linking Facebook account', { error, userId, facebookId });
      throw error;
    }
  }

  /**
   * Link Twitter account to existing user
   */
  async linkTwitterAccount(userId: string, twitterId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Linking Twitter account to user', { userId, twitterId });
      
      // Update user with Twitter ID
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { twitterId } },
        { new: true }
      );
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      LoggerConfig.info('Twitter account linked to user', { userId, twitterId });
      return user;
    } catch (error) {
      LoggerConfig.error('Error linking Twitter account', { error, userId, twitterId });
      throw error;
    }
  }

  /**
   * Link Apple account to existing user
   */
  async linkAppleAccount(userId: string, appleId: string): Promise<UserDocument> {
    try {
      LoggerConfig.info('Linking Apple account to user', { userId, appleId });
      
      // Update user with Apple ID
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { appleId } },
        { new: true }
      );
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      LoggerConfig.info('Apple account linked to user', { userId, appleId });
      return user;
    } catch (error) {
      LoggerConfig.error('Error linking Apple account', { error, userId, appleId });
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