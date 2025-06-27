// models/user/user.types.ts
import { Document, Model } from 'mongoose';

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
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isVerified?: boolean;
  avatar?: string;
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
   resetPasswordToken?: string;
   resetPasswordExpires?: Date;  
   passwordResetToken?: string; 

}

// UserDocument — extends Mongo Document and adds methods
// models/user/user.types.ts
export interface IUserFields {
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  isVerified?: boolean;
  avatar?: string;
}

// Document interface extends Mongoose's Document and our fields
export interface UserDocument extends Document, IUserFields {
  verifyPassword(password: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  getResetPasswordToken(): string;
  clearResetToken(): void;
}


// UserModel — static methods interface
export interface IUserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
