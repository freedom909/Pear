import jwt, { SignOptions } from 'jsonwebtoken';
import { UserDocument } from '../models/user/user.types';
import { JwtTokens } from '../models/interface/index';
import { promisify } from 'util';

/**
 * JWT Utility
 * Handles JWT token generation and verification
 */
export class JwtUtil {
  /**
   * Generate access and refresh tokens
   * @param user User document
   */
  static generateTokens(user: UserDocument): JwtTokens {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate access token
   * @param user User document
   */
  static generateAccessToken(user: UserDocument): string {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'secure-random-string-here', {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      algorithm: 'HS256',
    } as SignOptions);
  }

  /**
   * Generate refresh token
   * @param user User document
   */

  static generateRefreshToken(user: UserDocument): string {
    const payload = {
      id: user._id,
      tokenVersion: user.tokenVersion || 0,
    };

    const secret = process.env.JWT_REFRESH_SECRET || 'another-secure-random-string-here';
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as SignOptions);
  }

  /**
   * Verify access token
   * @param token Access token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'access_secret'
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param token Refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode token without verification
   * @param token JWT token
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
    }
}

interface TokenPayload {
  id: string;
}

export const createToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  return (await promisify(jwt.verify)(
    token,
    
  )) as unknown as TokenPayload;
};