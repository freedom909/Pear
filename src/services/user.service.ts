import User from '../models/user/user.model';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';
import mongoose from 'mongoose';
import Math from 'mathjs'
import bcrypt from 'bcryptjs';
import {OAuthTokenInfo} from '../models/interface/index';
import {IUser,UserDocument,Profile} from '../models/interface/index';

// 用户服务接口
interface UserService {
  getUsers(page?: number, limit?: number): Promise<UsersResponse>;
  getUserById(id: string): Promise<UserResponse>;
  createUser(userData: CreateUserDTO): Promise<UserResponse>;
  updateUser(id: string, userData: UserDocument, options?: Record<string, any>): Promise<UserDocument>;
  deleteUser(id: string): Promise<void>;
  findOne(query: Record<string, any>): Promise<UserDocument>;
  create(userData: {
    email: string;
    name: string;
    password?: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
    profile?:Partial<IUser>;//IUser constains all the properties providerId
    avatar?:string;
  }): Promise<UserDocument>;
  findOneOrCreate(profile: any, tokenInfo: OAuthTokenInfo): Promise<UserDocument>;
}

// 创建用户DTO
export interface CreateUserDTO {
  username: string;
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
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

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
      const pages = Math.ceil(total / limit);

      // 格式化用户数据
      const formattedUsers = users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return {
        users: formattedUsers as unknown as UserResponse[],//The expected type comes from property 'users' which is declared here on type 'UsersResponse'
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      };
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      throw ErrorResponse.internalError('获取用户列表失败');
    }
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户响应
   */
  async getUserById(id: string): Promise<UserResponse> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ErrorResponse.badRequest('无效的用户ID');
      }

      // 查找用户
      const user = await User.findById(id);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }

      return {
        id: user._id as unknown as string,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error(`获取用户失败 (ID: ${id}):`, error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('获取用户失败');
    }
  }

  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 用户响应
   */
  async createUser(userData: CreateUserDTO): Promise<UserResponse> {
    try {
      // 检查用户名是否已存在
      const existingUsername = await User.findOne({ username: userData.username });
      if (existingUsername) {
        throw ErrorResponse.badRequest('用户名已被使用');
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw ErrorResponse.badRequest('邮箱已被注册');
      }

      // 创建新用户
      const user = await User.create(userData) as UserDocument;

      return {
        id: user._id as unknown as string,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('创建用户失败:', error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('创建用户失败');
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
        throw ErrorResponse.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }

      // 如果更新用户名，检查是否已存在
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await User.findOne({ username: userData.username });
        if (existingUsername) {
          throw ErrorResponse.badRequest('用户名已被使用');
        }
      }

      // 如果更新邮箱，检查是否已存在
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          throw ErrorResponse.badRequest('邮箱已被注册');
        }
      }

      // 更新用户
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw ErrorResponse.notFound('用户不存在');
      }

      return {
        id: updatedUser._id as unknown as string,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      } as unknown as UserDocument;
    } catch (error) {
      logger.error(`更新用户失败 (ID: ${id}):`, error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('更新用户失败');
    }
  }
  
  /**
   * 根据条件查找单个用户
   * @param query 查询条件
   * @returns 用户文档
   */
  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户文档
   */
  async findById(id: string): Promise<UserDocument> {
    try {
      // 验证ID格式
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ErrorResponse.badRequest('无效的用户ID');
      }

      const user = await User.findById(id);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }
      return user as unknown as UserDocument;
    } catch (error) {
      logger.error(`根据ID查找用户失败 (ID: ${id}):`, error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('根据ID查找用户失败');
    }
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return User.findOne({ googleId });
  }

  async findOne(query: Record<string, any>): Promise<UserDocument> {
    try {
      const user = await User.findOne(query);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }
      return user as unknown as UserDocument;
    } catch (error) {
      logger.error('查找用户失败:', error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('查找用户失败');
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
    avatar?:string;
    profile?:Partial<IUser>
  }): Promise<UserDocument> {
    try {
      // 创建新用户
      const newUser = await User.create({
        username: userData.name || userData.email.split('@')[0],
        email: userData.email,
        password: await bcrypt.hash(Math.random().toString(), 10),
        role: 'user',
        provider: userData.provider,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
      }) as UserDocument;
      return newUser as unknown as UserDocument;
    } catch (error) {
      logger.error('创建OAuth用户失败:', error);
      throw ErrorResponse.internalError('创建OAuth用户失败');
    }
  }

  /**
   * 查找或创建OAuth用户
   * @param profile OAuth用户资料
   * @param tokenInfo 令牌信息
   * @returns 用户文档
   */
  async findOneOrCreate(profile: any, tokenInfo: OAuthTokenInfo): Promise<UserDocument> {
    try {
      // 检查用户是否存在
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      if (existingUser) {
        return existingUser as unknown as UserDocument;
      }
      // 创建新用户
      const newUser=await this.create({
        email: profile.emails[0].value,
        name: profile.name,
        provider: profile.provider,
        accessToken: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken||'',
      });
      return newUser as unknown as UserDocument;
    } catch (error) {
      logger.error('处理OAuth用户失败:', error);
      throw ErrorResponse.internalError('处理OAuth用户失败');
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
        throw ErrorResponse.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }

      // 如果更新用户名，检查是否已存在
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await User.findOne({ username: userData.username });
        if (existingUsername) {
          throw ErrorResponse.badRequest('用户名已被使用');
        }
      }

      // 如果更新邮箱，检查是否已存在
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          throw ErrorResponse.badRequest('邮箱已被注册');
        }
      }

      // 更新用户
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        throw ErrorResponse.internalError('更新用户失败');
      }
      return updatedUser as unknown as UserDocument;
    } catch (error) {
      logger.error(`更新用户失败 (ID: ${id}):`, error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('更新用户失败');
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
        throw ErrorResponse.badRequest('无效的用户ID');
      }

      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        throw ErrorResponse.notFound('用户不存在');
      }

      // 删除用户
      await User.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`删除用户失败 (ID: ${id}):`, error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('删除用户失败');
    }
  }
  
  async createUserFromGoogleProfile(profile: Profile): Promise<UserDocument> {
    return User.create({
      googleId: profile._id,
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      photo: profile.avatar || '',
      password: Math.random().toString(36).slice(-8),
      provider: 'google',
      role: 'user',
      // 他の必要な初期値を追加
    });
  }
  
}
const userService = new UserServiceImpl();
// 导出用户服务实例
export default userService;