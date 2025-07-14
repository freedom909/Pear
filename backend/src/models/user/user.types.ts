// models/user/user.types.ts
import { Document, Model } from 'mongoose';

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest',
}

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Authentication providers
 */
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TWITTER = 'twitter',
}

/**
 * Basic user fields
 */
export interface IUser {
  email: string;
  firstname: string;
  lastname: string;
  username?: string;
  password?: string;
  // Roles and status
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerId?: string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;

  lastLogin?: Date;
  passwordChangedAt?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiresIn?: number;
  // Optional: versioning tokens
  tokenVersion?: number;
}

/**
 * Mongoose Document interface
 */
export interface UserDocument extends Document, Omit<IUser, 'resetPasswordExpiresIn'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getSignedJwtToken(): string;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  resetPasswordExpiresIn(): number;
  clearResetToken(): void;
  generateAccessToken(): string;
  generateResetPasswordToken(): string;
}

/**
 * Mongoose Model interface (for future static methods)
 */
export interface IUserModel extends Model<UserDocument> {}
