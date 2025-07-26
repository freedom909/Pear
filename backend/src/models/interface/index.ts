//models/interface/index.ts

import { AuthProvider } from "../user/user.types";


export const UserRole = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  USER: 'user' as const,
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export enum UserStatus {
  ACTIVE= 'active',
  INACTIVE='inactive',
  SUSPENDED='suspended',
}

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
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  firstname?: string;
  lastname?: string;
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
  status?: typeof UserStatus;
  profile?: Partial<IUserProfile>;
  security?: Partial<IUserSecurity>;
}

export interface IUserFilters {
  email?: string | RegExp;
  role?: UserRole;
  status?: typeof UserStatus;
  verified?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  'profile.firstname'?: string | RegExp;
  'profile.lastname'?: string | RegExp;
  'profile.phoneNumber'?: string;
  'profile.address.country'?: string;
  search?: string;
}
/**
 * OAuth profile interface
 */

export interface OAuthProfile {
  id: string;
  provider: AuthProvider;
  email:string;

  avatar?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  status?: UserStatus;
  role?: UserRole;
  //providerId?: string;
  profile?: Partial<IUserProfile>;
  isVerified?: boolean;
  accessToken?: string;
  refreshToken?: string;
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
}

export interface OAuthStrategy {
  authenticate: (req: any, options: any, callback: any) => void;
  userProfile: (
    accessToken: string,
    done: (err: any, profile?: any) => void
  ) => void;
}