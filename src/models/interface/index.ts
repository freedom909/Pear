import { Document, Model } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface Profile {
  _id: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
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
  lastLogin?: Date;
 
  gender?: 'male' | 'female' | 'other';
}

// export interface IUser extends Document {
//   username: string;
//   email: string;
//   password: string;
//   role: 'user' | 'admin';
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(password: string): Promise<boolean>;
//   generateAuthToken(): string;
//   generateRefreshToken(): string;
// }
export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OAuthTokenInfo {
  accessToken: string;
  refreshToken?: string;
  provider: string;
  expiresIn?: number;
}

export interface IUserProfile {
  _id: string;
  email?: string;
  password?:string
  role?: UserRole;
  status?: UserStatus;
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
  lastLogin?: Date;
 
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
  save: () => Promise<void>;
}

export interface OAuthToken {
  kind: string;
  accessToken: string;
  refreshToken: string;
  expires?: Date;
}

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

export interface UserDocument extends Document {
  [key: string]: any;
  id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  tokens?: OAuthToken[];
  googleId?: string;
  facebookId?: string;
  twitterId?: string;
  appleId?: string;
  photo?: string;
  tokenInfo?: string[],
  refreshTokens: string[];
  refreshTokensExpires?: Date;
  profile?: IUserProfile;
  security?: IUserSecurity;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
export interface IUserCreate {
  email: string;
  password: string;
  role?: UserRole;
  profile?: Partial<IUserProfile>;
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface IUserUpdate {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: Partial<IUserProfile>;
  security?: Partial<IUserSecurity>;
}

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
  search?: string; 
}

export interface IUserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findByVerificationToken(token: string): Promise<UserDocument | null>;
  findByPasswordResetToken(token: string): Promise<UserDocument | null>;
  findByRefreshToken(token: string): Promise<UserDocument | null>;
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
  pre(hook: 'save', callback: (this: UserDocument, next: (err?: Error) => void) => Promise<void>): void;
  save: () => Promise<void>;
  methods: {
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    generateEmailVerificationToken: () => Promise<string>;
    generatePasswordResetToken: () => Promise<string>; 
    generateRefreshToken: () => Promise<string>;
  };
  password: string;
  passwordResetToken?: string; 
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  verified?: boolean;
  provider?: string;
  email?: string;
  id?: string;
}
/**
 * OAuth profile interface
 */

export interface OAuthProfile {
  id: string;
  provider: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
}

/**
 * OAuth configuration interface
 */
export interface OAuthConfig {
  provider: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: string[];
  // Apple specific fields
  teamID?: string;
  keyID?: string;
  privateKey?: string;
  privateKeyLocation?: string;
  passReqToCallback?: boolean;
  // authorizationParams: { [key: string]: any };
  // name?: string;
  // scopeSeparator?: string;
  // state?: boolean;
  // customHeaders?: { [key: string]: any };
  // _oauth2: OAuthConfig;
}

export interface IUserProfile {
  
  authenticate: (req: any, options: any, callback: any) => void;
  userProfile: (accessToken: string, done: (err: any, profile?: any) => void) => void;
}
export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  profilePhoto?: string;
  bio?: string;
  
  // OAuth 相关字段
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
  
  // 账户状态
  isActive: boolean;
  lastLogin?: Date;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  
  // 生成令牌
  generateAuthToken(): string;
  generateRefreshToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): Promise<string>;
  generatePasswordResetToken(): Promise<string>;
}