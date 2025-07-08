// models/user/user.types.ts
import { Document, Model } from 'mongoose';
import { Timestamps } from '../base.interface';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// IUser — plain data
export interface IUser {


  // Username
  username: {
    firstname: string;
    lastname: string;
  };

  // Local auth
  email: string;
  password?: string;
  passwordHash: string;
  salt: string;

  // Roles and status
  role: UserRole;
  status: UserStatus;
  provider?: 'local' | 'google' | 'facebook' | 'twitter' | 'apple';

  // Verification
  isVerified?: boolean;

  // Timestamps

  lastLogin?: Date;

  // Avatar
  avatar?: string;

  // OAuth fields
  googleId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;

  facebookId?: string;
  facebookAccessToken?: string;
  facebookRefreshToken?: string;

  twitterId?: string;
  twitterAccessToken?: string;
  twitterRefreshToken?: string;

  appleId?: string;
  appleAccessToken?: string;
  appleRefreshToken?: string;

  // Password reset
  resetPasswordToken?: string;
  passwordResetToken?: string;
  resetPasswordExpires?: Date;

  // Session refresh tokens
  refreshToken?: string;
}

// UserDocument — extends Mongo Document and adds methods
// models/user/user.types.ts


// Document interface extends Mongoose's Document and our fields
export interface UserDocument extends Document, IUser, Timestamps {
  verifyPassword(password: string): Promise<boolean>;
  comparePassword(candidatePassword: string): Promise<boolean>;
  clearResetToken(): void;
  getSignedJwtToken(): string;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
  setPassword(password: string): void;
  getResetPasswordToken(): string;
  findByEmail(email: string): Promise<UserDocument | null>;
  linkedAccounts(): Promise<any>;
}

// UserModel — static methods interface
export interface IUserModel extends Model<UserDocument> {
  
}