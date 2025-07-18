// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {asyncHandler} from '../middleware/asyncHandler';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import userService from '../services/user.service';
import { UserRole } from '../models/user/user.types';
import { UserDocument } from '../models/user/user.types';
// Use the same JWT secret as in tests
const jwtSecret = 'secure-random-string-here';

export interface AuthRequest extends Request {
  user?: UserDocument;
}

/**
 * Middleware: Protect routes
 * - Verifies JWT
 * - Loads user
 * - Attaches req.user
 * - Handles token refresh if needed
 */

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw AppError.unauthorized('Missing token');
  }

  const decoded: any = jwt.verify(token, jwtSecret);
  console.log('✅ Decoded token:', decoded);

  if (!decoded?.id) {
    throw AppError.badRequest('Invalid token payload');
  }

  // Get user from service
  const user = await userService.getUserById(decoded.id);
  console.log('✅ User from service:', user); // Debug log
  
  if (!user) {
    throw AppError.unauthorized('User not found');
  }

  // Assign the user document to req.user
  // Ensure user has all required properties for UserDocument
  req.user = {
    ...user,
    id: user.id || decoded.id, // Ensure id is set
  } as UserDocument;
  console.log('✅ req.user set to:', req.user); // Debug log

  next();
});

export const isAuthenticated = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(
      new AppError({
        message: 'Not authenticated',
        code: ErrorCode.UNAUTHORIZED,
        details: 'User not found',
      })
    );
  }

  next();
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