import jwt from 'jsonwebtoken';
import { User, IUser, UserRole, UserStatus } from '../models';
import { userService } from './user.service';
import { config } from '../config/app.config';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError,
  ErrorCode 
} from '../config/error.config';
import { LoggerConfig } from '../config/logger.config';

/**
 * Token payload interface
 */
interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Token response interface
 */
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
    verified: boolean;
    avatar?: string;
  };
}

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<TokenResponse> {
    try {
      // Create user
      const user = await userService.createUser({
        ...userData,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        verified: false
      });
      
      // Generate tokens
      return this.generateTokenResponse(user);
    } catch (error) {
      LoggerConfig.error('Error registering user', { error });
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new UnauthorizedError(
          ErrorCode.INVALID_CREDENTIALS,
          'Invalid email or password'
        );
      }
      
      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError(
          ErrorCode.FORBIDDEN,
          'Your account is not active'
        );
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedError(
          ErrorCode.INVALID_CREDENTIALS,
          'Invalid email or password'
        );
      }
      
      // Generate tokens
      return this.generateTokenResponse(user);
    } catch (error) {
      LoggerConfig.error('Error logging in user', { error });
      throw error;
    }
  }

  /**
   * Login or register with Google
   */
  async googleAuth(profile: {
    id: string;
    emails: Array<{ value: string }>;
    name: { givenName: string; familyName: string };
    photos?: Array<{ value: string }>;
  }): Promise<TokenResponse> {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const avatar = profile.photos?.[0]?.value;
      
      // Check if user exists by Google ID
      let user = await userService.findUserByGoogleId(googleId);
      
      // If not found by Google ID, check by email
      if (!user) {
        user = await userService.findUserByEmail(email);
        
        if (user) {
          // Update existing user with Google ID
          user.googleId = googleId;
          if (avatar) {
            user.avatar = avatar;
          }
          await user.save();
        } else {
          // Create new user
          user = await userService.createUser({
            email,
            firstName,
            lastName,
            googleId,
            avatar,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            verified: true // Google users are automatically verified
          });
        }
      }
      
      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError(
          ErrorCode.FORBIDDEN,
          'Your account is not active'
        );
      }
      
      // Generate tokens
      return this.generateTokenResponse(user);
    } catch (error) {
      LoggerConfig.error('Error with Google authentication', { error });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, config.jwtConfig.refreshSecret) as TokenPayload;
      
      // Find user
      const user = await User.findById(payload.userId).select('+refreshTokens');
      
      if (!user) {
        throw new UnauthorizedError(
          ErrorCode.INVALID_TOKEN,
          'Invalid refresh token'
        );
      }
      
      // Check if refresh token exists in user's refresh tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedError(
          ErrorCode.INVALID_TOKEN,
          'Invalid refresh token'
        );
      }
      
      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError(
          ErrorCode.FORBIDDEN,
          'Your account is not active'
        );
      }
      
      // Remove old refresh token
      await user.removeRefreshToken(refreshToken);
      
      // Generate new tokens
      return this.generateTokenResponse(user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError(
          ErrorCode.INVALID_TOKEN,
          'Invalid refresh token'
        );
      }
      
      LoggerConfig.error('Error refreshing token', { error });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, config.jwtConfig.refreshSecret) as TokenPayload;
      
      // Find user
      const user = await User.findById(payload.userId).select('+refreshTokens');
      
      if (!user) {
        return; // User not found, nothing to do
      }
      
      // Remove refresh token
      await user.removeRefreshToken(refreshToken);
    } catch (error) {
      // Ignore token verification errors
      if (!(error instanceof jwt.JsonWebTokenError)) {
        LoggerConfig.error('Error logging out user', { error });
        throw error;
      }
    }
  }

  /**
   * Logout user from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    try {
      // Find user
      const user = await User.findById(userId).select('+refreshTokens');
      
      if (!user) {
        throw new NotFoundError(
          ErrorCode.NOT_FOUND,
          'User not found'
        );
      }
      
      // Clear all refresh tokens
      await user.clearRefreshTokens();
    } catch (error) {
      LoggerConfig.error('Error logging out user from all devices', { error });
      throw error;
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtConfig.accessSecret) as TokenPayload;
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
  private generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    return jwt.sign(payload, config.jwtConfig.accessSecret, {
      expiresIn: config.jwtConfig.accessExpiresIn
    });
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(user: IUser): Promise<string> {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(payload, config.jwtConfig.refreshSecret, {
      expiresIn: config.jwtConfig.refreshExpiresIn
    });
    
    // Add refresh token to user's refresh tokens
    await user.addRefreshToken(token);
    
    return token;
  }

  /**
   * Generate token response
   */
  private async generateTokenResponse(user: IUser): Promise<TokenResponse> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwtConfig.accessExpiresInMs,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        verified: user.verified,
        avatar: user.avatar
      }
    };
  }
}

// Export singleton instance
export const authService = new AuthService();

// Import NotFoundError after declaration to avoid circular dependency
import { NotFoundError } from '../config/error.config';