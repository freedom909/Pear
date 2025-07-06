import User from '../models/user/user.model';
import ErrorCode from '../errors/error-code';
import { AppError } from '../errors/appError';
import logger from '../middleware/logger';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as mathjs from 'mathjs';
import bcrypt from 'bcryptjs';
import { Profile as PassportProfile } from 'passport';
import { OAuthTokenInfo } from '../models/interface/index';
import {
  IUser,
  IUserProfile,
  UserStatus,
  UserRole,
  IUserModel,
} from '../models/interface/index';
import { UserDocument } from '../models/user/user.types';

export interface CreateUserFromOAuthProfileInput {
  id: string;
  name: { familyName: string; givenName: string };
  emails: { value: string }[];
  username?: string;
  password?: string;
  avatar?: string;
  isVerified: boolean;
  provider: 'local'|'apple' | 'google' | 'facebook' | 'twitter' | 'github';
  oauth?: any;
}


// 用户服务接口
export interface UserService {
  linkProvider(
    userId: string,
    provider: string,
    providerId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<UserDocument>;
  getUsers(page?: number, limit?: number): Promise<UsersResponse>;
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

  createOAuthUser(userData: UserDocument): Promise<IUserProfile>;
  updateUser(
    id: string,
    userData: UserDocument,
    options?: Record<string, any>
  ): Promise<UserDocument>;
  deleteUser(id: string): Promise<void>;
  findOne(query: Record<string, any>): Promise<UserDocument>;
  findUserByProvider(
    provider: string,
    providerId: string
  ): Promise<UserDocument | null>;
  create(userData: {
    email: string;
    name: string;
    password?: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
    profile?: Partial<IUser>;
    avatar?: string;
  }): Promise<UserDocument>;
  findOneOrCreate(
    profile: any,
    tokenInfo: OAuthTokenInfo
  ): Promise<UserDocument>;
}
/**
 * 链接第三方账户
 * @param userId 用户ID
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
  username: string;
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
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    isVerified: boolean;
    avatar?: string;
  };
}
// 用户列表响应
export interface UsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// 用户服务实现
class UserServiceImpl implements UserService {
  /**
   * 获取用户列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 用户列表响应
   */
  async getUsers(page = 1, limit = 10): Promise<UsersResponse> {
    try {
      // 验证页码和限制
      if (page < 1) {
        page = 1;
      }
      if (limit < 1 || limit > 100) {
        limit = 10;
      }

      // 计算跳过的文档数
      const skip = (page - 1) * limit;

      // 查询用户总数
      const total = await User.countDocuments();

      // 查询用户列表
      const users = await User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // 计算总页数
      const pages = mathjs.ceil(total / limit);

      // 格式化用户数据
      const formattedUsers = users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      }));

      return {
        users: formattedUsers as unknown as UserResponse[],
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      };
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      throw new AppError({
        message: '获取用户列表失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户响应
   */
  async getUserById(id: string): Promise<UserDocument> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.badRequest('无效的用户ID');
      }

      // 查找用户
      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      return {
        id: user._id as unknown as string,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.isVerified || false,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      } as unknown as UserDocument;
    } catch (error) {
      logger.error(`获取用户失败 (ID: ${id}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '获取用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  /**
   * 根据用户名获取用户
   * @param username 用户名'获取用户失败');
   * @returns 用户响应
   * */
  async getUserByUsername(username: string): Promise<UserDocument> {
    try {
      // 验证用户名格式
      if (!username) {
        throw new AppError({
          message: '无效的用户名',
          code: ErrorCode.BAD_REQUEST,
        });
      }
      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        throw AppError.notFound('用户不存在');
      }
      return {
        id: user._id as unknown as string,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.isVerified || false,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      } as unknown as UserDocument;
    } catch (error) {
      logger.error(`根据用户名查找用户失败 (username: ${username}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '根据用户名查找用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async findUserByProvider(
    provider: string,
    providerId: string
  ): Promise<UserDocument | null> {
    try {
      const user = (await User.findOne({
        'profile.provider': provider,
        'profile.providerId': providerId,
      })) as UserDocument;
      return user;
    } catch (error) {
      logger.error(`根据${provider}ID查找用户失败 (ID: ${providerId}):`, error);
      throw new AppError({
        message: `根据${provider}ID查找用户失败`,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param userData 用户数据
   * @returns 用户响应
   */
  async updateUserAdmin(
    id: string,
    userData: UserDocument
  ): Promise<UserDocument> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      // 更新用户
      const updatedUser = (await User.findByIdAndUpdate(id, userData, {
        new: true,
      })) as UserDocument;
      return updatedUser;
    } catch (error) {
      logger.error(`更新用户失败 (ID: ${id}):`, error);
      {
        throw new AppError({
          message: '更新用户失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: error as Error,
        });
      }
    }
  }
  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 用户响应
   */
  async createOAuthUser(userData: UserDocument): Promise<IUserProfile> {
    try {
      // 检查用户名是否已存在
      const existingUsername = await User.findOne({
        username: userData.username,
      });
      if (existingUsername) {
        throw AppError.badRequest('用户名已被使用');
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw AppError.badRequest('邮箱已被注册');
      }

      // 创建新用户
      const user = (await User.create(userData)) as unknown as UserDocument;

      return {
        id: user._id as unknown as string,
        username: `${user.username.firstname} ${user.username.lastname}`,
        email: user.email,
        role: user.role,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      } as unknown as IUserProfile;
    } catch (error) {
      logger.error('创建用户失败:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '创建用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param userData 用户数据
   * @returns 用户响应
   */
  async updateUser(id: string, userData: UserDocument): Promise<UserDocument> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      // 如果更新用户名，检查是否已存在
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await User.findOne({
          username: userData.username,
        });
        if (existingUsername) {
          throw AppError.badRequest('用户名已被使用');
        }
      }

      // 如果更新邮箱，检查是否已存在
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          throw AppError.badRequest('邮箱已被注册');
        }
      }

      // 更新用户
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw AppError.notFound('用户不存在');
      }

      return {
        id: updatedUser._id as unknown as string,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: (updatedUser as unknown as UserDocument).createdAt,
        updatedAt: (updatedUser as unknown as UserDocument).updatedAt,
      } as unknown as UserDocument;
    } catch (error) {
      logger.error(`更新用户失败 (ID: ${id}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '更新用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * getResetPasswordToke
   * @returns token
   * /
   */

  async getResetPasswordToken(email: string): Promise<string> {
    try {
      const user = (await User.findOne({ email })) as UserDocument;
      if (!user) {
        throw AppError.notFound('用户不存在');
      }
      const token = user.generateResetPasswordToken();
      return token;
    } catch (error) {
      logger.error('生成重置密码令牌失败:', error);
      throw new AppError({
        message: '生成重置密码令牌失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * to generate token Response
   * generateTokenResponse
   * @returns tokenResponse
   */
  async generateTokenResponse(user: UserDocument): Promise<TokenResponse> {
    try {
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      return {
        accessToken,
        refreshToken,
        expiresIn: 3600,
        user: {
          id: user._id as unknown as string,
          email: user.email,
          firstName: user.username.firstname,
          lastName: user.username.lastname,
          role: (user as any).role,
          status: user.status,
          isVerified: user.isVerified || false,
          avatar: user.avatar || '/images/avatar.jpg', // Default avatar
        },
      };
    } catch (error) {
      logger.error('生成令牌失败:', error);
      throw new AppError({
        message: '生成令牌失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户文档
   */
  async findById(id: string): Promise<UserDocument> {
    try {
      // 验证ID格式
    // IDが空なら早期リターン
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('无效的用户ID');
    }

      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }
      return user as UserDocument;
    } catch (error) {
      logger.error(`根据ID查找用户失败 (ID: ${id}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '根据ID查找用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return User.findOne({ googleId });
  }

  async findOne(query: Record<string, any>): Promise<UserDocument> {
    try {
      const user = await User.findOne(query);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }
      return user as unknown as UserDocument;
    } catch (error) {
      logger.error('查找用户失败:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '查找用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * 创建OAuth用户
   * @param userData 用户数据
   * @returns 用户文档
   */
  async create(userData: {
    email: string;
    name: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
    avatar?: string;
    profile?: Partial<IUser>;
  }): Promise<UserDocument> {
    try {
      // 创建新用户
      const newUser = (await User.create({
        username: {
          firstname: userData.name.split(' ')[0] || 'google',
          lastname: userData.name.split(' ')[1] || 'son of google',
        },

        email: userData.email,
        password: await bcrypt.hash(mathjs.random().toString(), 10),
        role: 'user',
        provider: userData.provider,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
      })) as unknown as UserDocument;
      return newUser as unknown as UserDocument;
    } catch (error) {
      logger.error('创建OAuth用户失败:', error);
      throw new AppError({
        message: '创建OAuth用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * 查找或创建OAuth用户
   * @param profile OAuth用户资料
   * @param tokenInfo 令牌信息
   * @returns 用户文档
   */
  async findOneOrCreate(
    profile: any,
    tokenInfo: OAuthTokenInfo
  ): Promise<UserDocument> {
    try {
      // 检查用户是否存在
      const existingUser = await User.findOne({
        email: profile.emails[0].value,
      });
      if (existingUser) {
        return existingUser as unknown as UserDocument;
      }
      // 创建新用户
      const newUser = await this.create({
        email: profile.emails[0].value,
        name: profile.name,
        provider: profile.provider,
        accessToken: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken || '',
      });
      return newUser as unknown as UserDocument;
    } catch (error) {
      logger.error('处理OAuth用户失败:', error);
      throw new AppError({
        message: '处理OAuth用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }
  /**
   * 更新用户
   * @param id 用户ID
   * @param userData 用户数据
   * */

  async update(id: string, userData: UserDocument): Promise<UserDocument> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      // 如果更新用户名，检查是否已存在
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await User.findOne({
          username: userData.username,
        });
        if (existingUsername) {
          throw AppError.badRequest('用户名已被使用');
        }
      }

      // 如果更新邮箱，检查是否已存在
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          throw AppError.badRequest('邮箱已被注册');
        }
      }

      // 更新用户
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        throw new AppError({
          message: '更新用户失败',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: Error,
        });
      }
      return updatedUser as unknown as UserDocument;
    } catch (error) {
      logger.error(`更新用户失败 (ID: ${id}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '更新用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      // 删除用户
      await User.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`删除用户失败 (ID: ${id}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '删除用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error as Error,
      });
    }
  }

  async createUserFromOAuthProfile(
    input: CreateUserFromOAuthProfileInput & { verified?: boolean }
  ): Promise<UserDocument> {
    try {
      if (!input.provider) {
        throw AppError.badRequest('无效的OAuth用户资料');
      }

      // Generate a placeholder email if none provided
      const email = input.emails[0]?.value || 
                   `${input.id}@${input.provider}.oauth.local`;

      const userData = {
        username: {
          firstname: input.name?.givenName || input.provider,
          lastname: input.name?.familyName || 'User'
        },
        email: email,
        avatar: input.avatar || '/images/avatar.jpg',
        verified: input.verified || false,
        provider: input.provider,
        [`${input.provider}`]: {
          id: input.id,
          ...(input.oauth || {}),
        },
      };

      const user = await User.create(userData);
      logger.info(`Created OAuth user for ${input.provider}: ${user._id}`);
      
      return {
        ...user.toObject(),
        avatar: userData.avatar
      } as unknown as UserDocument;
    } catch (error) {
      logger.error('创建OAuth用户失败:', {
        provider: input.provider,
        error: error instanceof Error ? error.message : String(error),
        input: {
          id: input.id,
          name: input.name,
          hasEmail: !!input.emails?.[0]?.value
        }
      });
      throw new AppError({
        message: '创建OAuth用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return User.findOne({ email }) as unknown as UserDocument;
  }

  async linkProvider(
    userId: string,
    provider: string,
    providerId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<UserDocument> {
    try {
      // 验证用户ID格式
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw AppError.badRequest('用户ID格式错误');
      }

      // 验证第三方账户提供商
      if (!['google', 'facebook', 'twitter', 'apple'].includes(provider)) {
        throw AppError.badRequest('第三方账户提供商错误');
      }

      // 验证第三方账户ID
      if (!providerId) {
        throw AppError.badRequest('第三方账户ID错误');
      }

      // 验证访问令牌
      if (!accessToken) {
        throw AppError.badRequest('访问令牌错误');
      }

      // 验证刷新令牌
      if (!refreshToken) {
        throw AppError.badRequest('刷新令牌错误');
      }

      // 查询用户
      const user = await User.findById(userId);

      // 验证用户是否存在
      if (!user) {
        throw AppError.notFound('用户不存在');
      }

      // 验证用户是否已绑定该第三方账户
      if ((user as any)[`${provider}.id`] === providerId) {
        throw AppError.badRequest('用户已绑定该第三方账户');
      }

      // 链接第三方账户
      (user as any)[provider] = {
        id: providerId,
        accessToken,
        refreshToken,
      } as unknown as UserDocument;
      // 保存用户
      await user.save();
      return user as unknown as UserDocument;
    } catch (error) {
      logger.error('链接第三方账户失败:', error);
      throw new AppError({
        message: '链接账户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  static async findOrCreateUser({
    provider,
    providerId,
    name,
    email,
  }: {
    provider: string;
    providerId: string;
    name?: string;
    email?: string;
  }): Promise<UserDocument> {
    let user = await User.findOne({ [`${provider}.id`]: providerId });

    if (!user) {
      if (email) {
        user = await User.findOne({ email });
      }

      if (!user) {
        user = new User({});
        if (email) {
          user.email = email;
        }
        if (name) {
          (user as any).name = name;
        }

        await user.save();
      } else {
        (user as any)[provider + 'Id'] = providerId as string;
        await user.save();
      }
    }

    return user as unknown as UserDocument;
  }

  static async unlinkOAuthAccount(
    userId: string,
    provider: string
  ): Promise<UserDocument> {
    const user = (await User.findById(userId)) as IUserModel & {
      [key: string]: any;
    };
    if (!user) {
      throw new Error('User not found');
    }
    user[provider] = undefined;
    await user.save();
    logger.info(`Unlinked ${provider} account for user: ${user.email}`);
    // Type assertion to resolve the type assignment issue
    return user as unknown as UserDocument;
  }

  static async linkOAuthAccount(
    userId: string,
    provider: string,
    providerId: string
  ): Promise<UserDocument> {
    const user = (await User.findById(userId)) as IUserModel & {
      [key: string]: any;
    };
    if (!user) {
      throw new Error('User not found');
    }
    user[provider] = { id: providerId };
    await user.save();
    logger.info(`Linked ${provider} account for user: ${user.email}`);
    return user as unknown as UserDocument;
  }

  static async createOAuthUser(
    provider: string,
    providerId: string,
    userData: Partial<UserDocument>
  ): Promise<UserDocument> {
    const existingUser = await User.findOne({ [`${provider}.id`]: providerId });
    if (existingUser) {
      return existingUser as unknown as UserDocument;
    }
    const user = new User({ ...userData, [provider]: { id: providerId } });
    await user.save();
    logger.info(`OAuth user created: ${user.email}`);
    return user as unknown as UserDocument;
  }

  async linkOAuthProviderToUser(
    existingUserByEmail: UserDocument,
    provider: string,
    providerId: string,
    profile: PassportProfile,
    emailVerified?: boolean
  ): Promise<UserDocument> {
    if (existingUserByEmail) {
      (existingUserByEmail as any)[provider] = { id: providerId };
      if (emailVerified) {
        existingUserByEmail.isVerified = true;
      }
      await existingUserByEmail.save();
      logger.info(
        `Linked ${provider} account for user: ${existingUserByEmail.email}`
      );
      return existingUserByEmail as unknown as UserDocument;
    } else {
      const user = new User({ 
        ...profile, 
        [provider]: { id: providerId },
        verified: emailVerified || false
      });
      await user.save();
      logger.info(`OAuth user created: ${user.email}`);
      return user as unknown as UserDocument;
    }
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const user = (await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })) as IUserModel;
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    logger.info(`Password reset for user: ${user.name}`);
  }

  async getUserByResetToken(token: string): Promise<UserDocument | null> {
    const user = (await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })) as IUserModel;
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    return user as unknown as UserDocument;
  }

  static async requestPasswordReset(
    email: string,
    token: string,
    expires: Date
  ): Promise<void> {
    const user = (await User.findOne({ email })) as IUserModel;
    if (!user) {
      return;
    }
    user.passwordResetToken = token || '';
    user.passwordResetExpires = expires;
    try {
      await user.save();
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error requesting password reset: ${email}`, {
          error: err,
        });
      }
      throw err;
    }
  }

  async generateResetPasswordToken(): Promise<string> {
    const token = Math.random().toString(36).substring(2);
    return token;
  }

  static async updateUser(
    userId: string,
    updateData: Partial<UserDocument>
  ): Promise<UserDocument | null> {
    const allowedUpdates = ['name', 'email', 'password', 'avatar'];
    const sanitizedData: any = {};
    for (const key of allowedUpdates) {
      if (updateData[key as keyof UserDocument] !== undefined) {
        sanitizedData[key] = updateData[key as keyof UserDocument];
      }
    }
    if (sanitizedData.password) {
      sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
    }
    const user = await User.findByIdAndUpdate(userId, sanitizedData, {
      new: true,
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user as unknown as UserDocument;
  }

  static async createUser(
    userData: Partial<UserDocument>
  ): Promise<UserDocument> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const user = new User({ ...userData, password: hashedPassword });
    try {
      await user.save();
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error creating user: ${userData.email}`, { error: err });
      }
      throw err;
    }
    logger.info(`User created: ${user._id}`);
    return user as unknown as UserDocument;
  }

  static async findUsers(
    filter: FilterQuery,
    page = 1,
    limit = 10
  ): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const users = (await User.find(filter)
      .skip(skip)
      .limit(limit)) as unknown as UserDocument[];
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    return { users, total, page, totalPages };
  }

  static async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email });
  }

  async findUserByProviderId(
    provider: string,
    providerId: string
  ): Promise<UserDocument | null> {
    return await User.findOne({ [`${provider}.id`]: providerId });
  }
  async findUserByOAuthProfile(
    profile: { id: string },
    provider: 'google'
  ): Promise<UserDocument | null> {
    const providerId = profile.id;
    return await User.findOne({ [`${provider}.id`]: providerId });
  }

  getSignedJwtToken(user: UserDocument): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not set');
    }

    return jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
  }

}
const userService = new UserServiceImpl();
// 导出用户服务实例
export default userService;