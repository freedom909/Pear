// models/user/user.types.ts
import {Schema, Document, Model} from 'mongoose';
import jwt from 'jsonwebtoken';
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
  comparePassword(candidatePassword: string): Promise<boolean>;

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

  getResetPasswordToken(): string;
  getSignedJwtToken(): string;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  resetPasswordExpiresIn(): number;
  clearResetToken(): void;
  generateAccessToken(): string;
  generateResetPasswordToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
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

// 实例方法

UserSchema.methods.getSignedJwtToken = function () {
  return `${process.env.JWT_SECRET_KEY}.${this._id}`; 
};

UserSchema.methods.generateAuthToken = function () {
  const payload = { _id: this._id, email: this.email };
  return jwt.sign(payload, process.env.JWT_SECRET || 'this is another secure random string here', { expiresIn: 300 });
};


// ✅ 添加静态方法

export interface IUserModel extends Model<UserDocument> {
}