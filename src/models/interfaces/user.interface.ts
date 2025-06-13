import { BaseDocument } from './base.interface';

/**
 * User roles enum
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * User profile interface
 */
export interface IUserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  bio?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    language?: string;
    timezone?: string;
    newsletter?: boolean;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

/**
 * User security settings interface
 */
export interface IUserSecurity {
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  lastLogin?: Date;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
}

/**
 * User document interface
 */
export interface IUser extends BaseDocument {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  profile: IUserProfile;
  security: IUserSecurity;
  verified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  refreshTokens: string[];

  // Virtual fields
  fullName: string;
  isLocked: boolean;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
  generatePasswordResetToken(): string;
  generateRefreshToken(): string;
  generateAccessToken(): string;
  changePassword(newPassword: string): Promise<void>;
  updateProfile(profile: Partial<IUserProfile>): Promise<void>;
  updateSecurity(security: Partial<IUserSecurity>): Promise<void>;
  verify(): Promise<void>;
  lock(): Promise<void>;
  unlock(): Promise<void>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

/**
 * User creation interface
 */
export interface IUserCreate {
  email: string;
  password: string;
  role?: UserRole;
  profile?: Partial<IUserProfile>;
}

/**
 * User update interface
 */
export interface IUserUpdate {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: Partial<IUserProfile>;
  security?: Partial<IUserSecurity>;
}

/**
 * User filter interface for queries
 */
export interface IUserFilters {
  email?: string | RegExp;
  role?: UserRole;
  status?: UserStatus;
  verified?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  'profile.firstName'?: string | RegExp;
  'profile.lastName'?: string | RegExp;
  'profile.phoneNumber'?: string;
  'profile.address.country'?: string;
  search?: string; // For full-text search
}

/**
 * Static methods interface
 */
export interface IUserModel {
  findByEmail(email: string): Promise<IUser | null>;
  findByVerificationToken(token: string): Promise<IUser | null>;
  findByPasswordResetToken(token: string): Promise<IUser | null>;
  findByRefreshToken(token: string): Promise<IUser | null>;
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}