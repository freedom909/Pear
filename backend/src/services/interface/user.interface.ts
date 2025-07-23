
import { OAuthTokenInfo } from '../../models/interface/index';
import  IUserProfile  from '../../models/user/user.model';
//import { PassportProfile } from '../../models/interface/index';
import { UserDocument } from '../../models/user/user.types';
import { UserRole } from '@/middleware/role';


export interface CreateUserFromOAuthProfileInput {
  id: string;
  name: { firstname: string; lastname: string };
  emails: { value: string }[];
  username?: string;
  password?: string;
  avatar?: string;
  isVerified: boolean;
  provider: 'local' | 'apple' | 'google' | 'facebook' | 'twitter' | 'github';
  oauth?: any;
  accessToken?: string;
  refreshToken?: string;
}

export interface PassportProfile {
  id: string;
  name: { firstname: string; lastname: string };
  emails: { value: string }[];
}

export interface IUserService {
  linkProvider(
    id: string,
    provider: string,
    providerId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<UserDocument>;
  getUsers(page?: number, limit?: number): Promise<IUsersResponse>;
  findUserByEmail(email: string): Promise<UserDocument | null>;
  getUserById(id: string): Promise<UserDocument>;
  getUserByResetToken(token: string): Promise<UserDocument | null>;
  generateResetPasswordToken(user: UserDocument): Promise<string>;
  linkOAuthProviderToUser(
    existingUserByEmail: UserDocument,
    provider: string,
    providerId: string,
    profile: PassportProfile,
    isVerified: boolean
  ): Promise<UserDocument>;

  createUserFromOAuthProfile(
    input: CreateUserFromOAuthProfileInput
  ): Promise<UserDocument>

  createOAuthUser(userData: UserDocument): Promise<typeof IUserProfile>;
  updateUser(id: string, userData: UpdateUserDTO): Promise<UserDocument>;

  updateOAuthUser(id: string, userData: UpdateUserDTO): Promise<UserDocument>;
  deleteUser(id: string): Promise<void>;
  findOne(query: Record<string, any>): Promise<UserDocument>;

  deleteUser(id: string): Promise<void>;
  findOne(query: Record<string, any>): Promise<UserDocument>;
  findUserByProvider(
    provider: string,
    providerId: string
  ): Promise<UserDocument | null>;

  findOneOrCreate(
    profile: any,
    tokenInfo: OAuthTokenInfo
  ): Promise<UserDocument>;
}


/**
 * 链接第三方账户
 * @param id 用户ID
 * @param provider 第三方账户提供商
 * @param providerId 第三方账户ID
 * @param accessToken 访问令牌
 * @param refreshToken 刷新令牌
 * @returns 用户文档
 */
export interface FilterQuery {
  _id?: string;
  email?: string;
  provider?: string;
  providerId?: string;
}

// 创建用户DTO
export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  status: 'active' | 'inactive';
  verified: boolean;
  photo?: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

// 更新用户DTO
export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
}

// 用户响应
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
//token response
export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    lastname: string;
    firstname: string;
    role: UserRole.USER;
    status: 'ACTIVE';
    isVerified: boolean;
    avatar?: string;
  };
}
// 用户列表响应
export interface IUsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}