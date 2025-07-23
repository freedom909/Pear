import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { OAuthProfile } from '../models/interface/index';
import { AuthProvider, IUserModel, UserDocument, UserRole } from '../models/user/user.types';
import { RegisterUserDTO } from '../dtos/userDTO';
import { AppError } from '../errors/appError';
import User from '../models/user/user.model';
import logger from '../middleware/logger';
import ErrorCode from '@/errors/error-code';
import { PassportProfile } from './interface/user.interface';
import mongoose from 'mongoose';

@injectable()
class UserService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async findUserByName(firstname: string, lastname: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({ firstname, lastname });
  }

  async findUserByProvider(provider: string, providerId: string): Promise<UserDocument | null> {
    return this.userRepository.findByProvider(provider, providerId);
  }

  async updateUser(userId: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    return this.userRepository.updateUser(userId, data);
  }

  async findByIdentifier(identifier: string, password: string): Promise<UserDocument> {
    const user = await this.userRepository.findByIdentifier(identifier);
    if (!user || !(await user.comparePassword(password))) {
      throw AppError.unauthorized('无效的凭据');
    }
    return user;
  }

  async createLocalUser(data: RegisterUserDTO): Promise<UserDocument> {
    return this.userRepository.createUser({
      firstname: data.firstname,
      lastname: data.lastname,
      username: `${data.firstname} ${data.lastname}`,
      email: data.email,
      password: data.password,
      role: UserRole.USER,
      provider: AuthProvider.LOCAL,
      providerId: data.email,
    });
  }

  /**
   * Handles OAuth login flow for a given provider and profile.
   * 
   * @param provider - The OAuth provider name (e.g., 'google', 'facebook')
   * @param profile - The user profile data from the OAuth provider
   * @returns The authenticated user document
   * 
   * @remarks
   * - First tries to find an existing user linked to the provider
   * - If not found, checks if user exists by email and links the provider
   * - If no user exists, creates a new user with the OAuth profile data
   */
  async handleOAuthLogin(provider: string, profile: OAuthProfile): Promise<UserDocument> {
    let user = await this.findUserByProvider(provider, profile.id);

    if (!user) {
      user = await this.findUserByEmail(profile.email || '');
      if (user) {
        await this.userRepository.linkProvider(
          user.id.toString(),
          provider,
          profile.id,
          profile.name?.givenName || profile.name?.familyName || '',
          profile.avatar || ''
        );
      } else {
        user = await this.createOAuthUser(profile);
      }
    }
    return user;
  }

  async createOAuthUser(profile: OAuthProfile): Promise<UserDocument> {
    return this.userRepository.createUser({
      email: profile.email || '',
      username: profile.name?.givenName || profile.name?.familyName || '',
      avatar: profile.avatar || '',
      provider: profile.provider as AuthProvider,
      providerId: profile.id,
      role: UserRole.USER,
    });
  }

  async getUserByResetToken(token: string): Promise<UserDocument | null> {
    return this.userRepository.getUserByResetToken(token);
  }

  async createUserFromOAuthProfile(profile: OAuthProfile): Promise<UserDocument> {
    return this.userRepository.createUser({
      email: profile.email || '',
      username: profile.name?.givenName || profile.name?.familyName || '',
      avatar: profile.avatar || '',
      provider: profile.provider as AuthProvider,
      providerId: profile.id,
      role: UserRole.USER,
    });
  }

  // 添加别名以匹配策略文件中的方法名
  createUser = this.createUserFromOAuthProfile;

async findOne(query: Record<string, any>): Promise<UserDocument> {
    console.trace('TRACE: findOne CALLED', query);
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

  async linkOAuthAccount(
    id: string,
    provider: string,
    providerId: string
  ): Promise<UserDocument> {
    const user = (await User.findById(id)) as IUserModel & {
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
        avatar: user.avatar,
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

  async findUserByProviderId(provider: string, providerId: string): Promise<UserDocument> {
    try {
      const user = await User.findOne({ [provider]: { id: providerId } });
      if (!user) {
        throw AppError.notFound('用户不存在');
      }
      return user as unknown as UserDocument;
    } catch (error) {
      logger.error(`查找用户失败 (Provider: ${provider}, Provider ID: ${providerId}):`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: '查找用户失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }
}
export default UserService;