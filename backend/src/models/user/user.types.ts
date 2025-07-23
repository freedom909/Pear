// models/user/user.types.ts
import {Schema, Document, Model } from 'mongoose';
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
  hashPassword(): Promise<string>;
  isVerified?: boolean;
  isActive?: boolean;
  // Roles and status
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerId?: string;
  avatar?: string;

  lastLogin?: Date;
  passwordChangedAt?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiresIn?: Date;
  clearResetToken: () => void;
  tokenVersion?: number;
  getUserByResetToken(token: string): Promise<IUser>;
}

/**
 * Mongoose Document interface
 */
export interface UserDocument extends Document, Omit<IUser, 'resetPasswordExpiresIn'> {
  createdAt: Date;
  updatedAt: Date;
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
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken: { type: String },
  resetPasswordExpiresIn: { type: Date }
});

// 清除 token 的方法
UserSchema.methods.clearResetToken = function () {
  this.passwordResetToken = undefined;
  this.resetPasswordExpiresIn = undefined;
};

// ✅ 添加静态方法

export interface IUserModel extends Model<UserDocument> {
}