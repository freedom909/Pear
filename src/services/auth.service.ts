import User from '../models/user/user.model';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';

import config from '../config/config';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
// 认证服务接口
interface AuthService {
  register(userData: RegisterDTO): Promise<AuthResponse>;
  login(identifier: string, password: string): Promise<AuthResponse>;
  refreshToken(token: string): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
}

// 注册DTO
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

// 认证响应
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// 认证服务实现
class AuthServiceImpl implements AuthService {
  /**
   * 用户注册
   * @param userData 用户注册数据
   * @returns 认证响应
   */
  async register(userData: RegisterDTO): Promise<AuthResponse> {
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
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      // 生成令牌
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      return {
        user: {
          id: user._id as string,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('注册失败:', error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('注册失败');
    }
  }

  /**
   * 用户登录
   * @param identifier 用户名或邮箱
   * @param password 密码
   * @returns 认证响应
   */
  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      // 查找用户（通过用户名或邮箱）
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      }).select('+password');

      // 检查用户是否存在
      if (!user) {
        throw ErrorResponse.unauthorized('无效的凭据');
      }

      // 验证密码
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw ErrorResponse.unauthorized('无效的凭据');
      }

      // 生成令牌
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      return {
        user: {
          id: user._id as string,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('登录失败:', error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('登录失败');
    }
  }

  /**
   * 刷新令牌
   * @param token 刷新令牌
   * @returns 新的认证响应
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // 验证刷新令牌
      const decoded = jwt.verify(token, config.jwt.secret) as { sub: string };
      
      // 查找用户
      const user = await User.findById(decoded.sub);
      if (!user) {
        throw ErrorResponse.unauthorized('无效的刷新令牌');
      }

      // 生成新令牌
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      return {
        user: {
          id: user._id as string,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('刷新令牌失败:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw ErrorResponse.unauthorized('无效的刷新令牌');
      }
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw ErrorResponse.internalError('刷新令牌失败');
    }
  }

  /**
   * 用户登出
   * @param userId 用户ID
   */
  async logout(userId: string): Promise<void> {
    // 在实际应用中，可能需要将令牌添加到黑名单
    // 或者在Redis中存储已注销的令牌
    // 这里简单实现，不做任何操作
    return Promise.resolve();
  }

  /*
   * 用户登出所有设备
   * @param userId 用户ID
   */
  async logoutAll(userId: string): Promise<void> {
    // 在实际应用中，可能需要将令牌添加到黑名单
    // 或者在Redis中存储已注销的令牌
    // 这里简单实现，不做任何操作
    return Promise.resolve();
  }

  /*
  **
  */
 async generateJwtForUser(user: any):Promise<string> {
  const payload = {
    sub: user._id,
    role: user.role,
  };
  // Cast the secret to Secret
  const secret = config.jwt.secret as Secret;
  const expiresIn = (config.jwt.expiresIn as unknown) as SignOptions['expiresIn'];

  const options: SignOptions = {
    expiresIn,
  };
    return jwt.sign(payload, secret, options);
  }
}

// 导出认证服务实例
export const authService = new AuthServiceImpl();