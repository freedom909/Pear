// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import userService from '../services/user.service';
import { UserRole } from '../models/interface/index';
import logger from './logger';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

/**
 * Middleware: Protect routes
 * - Verifies JWT
 * - Loads user
 * - Attaches req.user
 */
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
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
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email?: string;
      role?: string;
    };

    const user = await userService.getUserById(decoded.userId);
    console.log('Loaded user:', user);
    if (!user) {
      return next(
        new AppError({
          message: 'User not found',
          code: ErrorCode.UNAUTHORIZED,
          details: 'User not found',
        })
      );
    }

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

/**
 * Middleware: Role check (alias for authorize)
 */
export const role = (...roles: UserRole[]) => authorize(...roles);
