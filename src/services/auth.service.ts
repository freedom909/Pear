import jwt from 'jsonwebtoken';
import { ErrorResponse } from '../utils/errorResponse';
import config from '../config/config';
import User  from '../models/user/user.model';
import { UserDocument } from '../models/interface/index';
import userService from '../services/user.service';
import { UnauthorizedError } from '@/utils/error';
import {ErrorCode} from '../utils/errors/error-code';
import { UserRole} from '../models/interface/index';


export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

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

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUsername = await User.findOne({ username: data.username });
    if (existingUsername) throw ErrorResponse.badRequest('用户名已被使用');

    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) throw ErrorResponse.badRequest('邮箱已被注册');

    const user = await User.create({ ...data });

    return this.buildAuthResponse(user);
  }

  /**
   * Login with username/email + password
   */
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('+password');
    if (!user) throw ErrorResponse.unauthorized('无效的凭据');

    if (!(await user.comparePassword(password))) {
      throw ErrorResponse.unauthorized('无效的凭据');
    }
    return this.buildAuthResponse(user);
  }

  /**
   * OAuth login or register
   */
  async oauthLogin(provider: string, profile: any): Promise<AuthResponse> {
    let user = await userService.findUserByProvider(provider, profile.id);

    if (!user) {
      user = await userService.findUserByEmail(profile.email);

      if (user) {
        // Link the provider account
        const userId = user._id as string;
        await userService.linkProvider(userId, provider, profile.id, profile.displayName, profile.avatarUrl);
      } else {
        const user = await userService.createOAuthUser(profile);
        if (!user) throw ErrorResponse.internalError('创建用户失败');
      }
    }

    return this.buildAuthResponse(user!);
  }

  /**
   * Generate auth tokens
   */
  private generateTokens(user: UserDocument) {
    return {
      accessToken: user.generateAuthToken(),
      refreshToken: user.generateRefreshToken(),
    };
  }
async generateJwtForUser(user: UserDocument): Promise<string> {
    const payload: TokenPayload = {
      userId: user._id as unknown as string,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as unknown as number,
    });
  }
  /**
   * Build auth response
   */
  private buildAuthResponse(user: UserDocument): AuthResponse {
    const tokens = this.generateTokens(user);
    return {
      user: {
        id: user._id as string,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }
  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;
    const user = await User.findById(decoded.userId);
    if (!user) throw ErrorResponse.unauthorized('无效的刷新令牌');
    return this.buildAuthResponse(user);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Implement any cleanup, token blacklist, etc.
    return;
  }

  /**
   * Logout all
   */
  async logoutAll(): Promise<void> {
    return;
  }
  
  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(
          ErrorCode.EXPIRED_TOKEN,
          'Access token expired'
        );
      }
      
      throw new UnauthorizedError(
        ErrorCode.INVALID_TOKEN,
        'Invalid access token'
      );
    }
  }

  /**
   * Generate access token
   */
  // private generateAccessToken(user: UserDocument): string {
  //   const payload: TokenPayload = {
  //     userId: user.id as unknown as string,
  //     email: user.email,
  //     role: user.role
  //   };
    
  //   return jwt.sign(payload, config.jwt.secret, {
  //     expiresIn: config.jwt.expiresIn as unknown as number,
  //   });
  // }

  /**
   * Generate refresh token
   */
  // private async generateRefreshToken(user: UserDocument): Promise<string> {
  //   const payload: TokenPayload = {
  //     userId: user._id as unknown as string,
  //     email: user.email,
  //     role: user.role
  //   };
    
  //   const token = jwt.sign(payload, config.jwt.secret, {
  //     expiresIn: config.jwt.expiresIn as unknown as number,
  //   });
    
  //   // Add refresh token to user's refresh tokens
  //   await user.addRefreshToken(token);
    
  //   return token;
  // }
}
export const authService = new AuthService();
// Export singleton instance
export default authService;




