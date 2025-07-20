//models/interface/index.ts


export const UserRole = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  USER: 'user' as const,
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  status: 'status' as const,
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  SUSPENDED: 'suspended' as const,
};

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
  status?: typeof UserStatus;
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

export interface OAuthStrategy {
  authenticate: (req: any, options: any, callback: any) => void;
  userProfile: (
    accessToken: string,
    done: (err: any, profile?: any) => void
  ) => void;
}