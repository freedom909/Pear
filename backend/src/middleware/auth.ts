// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import userService from '../services/user.service';
import { UserRole } from '../models/user/user.types';
import logger from './logger';


export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

/**
 * Middleware: Protect routes
 * - Verifies JWT
 * - Loads user
 * - Attaches req.user
 * - Handles token refresh if needed
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;
  let refreshToken: string | undefined;

  // Get tokens from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Get refresh token from cookies
  if (req.cookies?.refreshToken) {
    refreshToken = req.cookies.refreshToken;
  }

  if (!token) {
    return next(
      new AppError({
        message: 'No authorization token provided',
        code: ErrorCode.UNAUTHORIZED,
        details: 'No authorization token provided',
      })
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email?: string;
      role?: string;
      exp?: number;
    };

    // Check if token is about to expire (less than 5 minutes remaining)
    const tokenExp = decoded.exp || 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = tokenExp - currentTime;
    
    // If token is about to expire and we have a refresh token
    if (timeRemaining < 300 && refreshToken) {
      try {
        // Verify refresh token
        const refreshDecoded = jwt.verify(refreshToken, config.jwt.refreshSecret || config.jwt.secret) as {
          userId: string;
        };
        
        if (refreshDecoded.userId === decoded.userId) {
          // Generate new token
          const user = await userService.getUserById(decoded.userId);
          if (user) {
            const newToken = jwt.sign(
              { userId: user.id, role: user.role },
              config.jwt.secret as string,
              { expiresIn:  '1d'}
            );
            
            // Set new token in cookie
            res.cookie('token', newToken, {
              expires: new Date(Date.now() + 3600000), // 1 hour
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            });
            
            // Update token for this request
            token = newToken;
          }
        }
      } catch (refreshErr) {
        logger.warn('Refresh token verification failed', refreshErr);
        // Continue with the original token
      }
    }

    // Load user from database
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return next(
        new AppError({
          message: 'User not found',
          code: ErrorCode.UNAUTHORIZED,
          details: 'User not found',
        })
      );
    }

    // Check if user is verified
    if (user.isVerified === false) {                  
      return next(
        new AppError({
          message: 'Email not verified',
          code: ErrorCode.FORBIDDEN,
          details: 'Please verify your email before accessing this resource',
        })
      );
    }

    // Attach user to request
    (req as AuthRequest).user = {
      id: user.id as string,
      role: user.role as UserRole,
    };

    next();
  } catch (err) {
    logger.error('JWT verification failed', err);
    return next(
      new AppError({
        message: 'Token is invalid or expired',
        code: ErrorCode.UNAUTHORIZED,
        details: 'Token is invalid or expired',
      })
    );
  }
};

/**
 * Middleware: Authorize roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError({
          message: 'Not authenticated',
          code: ErrorCode.UNAUTHORIZED,
          details: 'User not found',
        })
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError({
          message: `Access denied: requires one of roles: [${roles.join(', ')}]`,
          code: ErrorCode.FORBIDDEN,
          details: 'User role is not authorized',
        })
      );
    }

    next();
  };
};

// 限制特定角色的访问

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError({
          message: 'Not authenticated',
          code: ErrorCode.UNAUTHORIZED,
          details: 'User not found',
        })
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError({
          message: `Access denied: requires one of roles: [${roles.join(', ')}]`,
          code: ErrorCode.FORBIDDEN,
          details: 'User role is not authorized',
        })
      );
    }

    next();
  };
};
/**
 * Middleware: Role check (alias for authorize)
 */
export const role = (...roles: UserRole[]) => authorize(...roles);