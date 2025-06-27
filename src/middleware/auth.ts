// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AppError } from '../errors/appError';
import userService from '../services/user.service';
import { UserRole } from '../models/interface/index';
import logger from './logger';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

/**
 * Protect middleware
 * - Verifies JWT
 * - Loads user info
 * - Attaches req.user
 */
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Get token from Authorization header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(AppError.unauthorized('Authentication token is missing'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { sub: string };

    const user = await userService.getUserById(decoded.sub);

    if (!user) {
      return next(AppError.unauthorized('User not found'));
    }

    req.user = {
      id: user.id as string,
      role: user.role as UserRole
    };

    next();
  } catch (err) {
    logger.error('JWT verification failed', err);
    return next(AppError.unauthorized('Token is invalid or expired'));
  }
};

/**
 * Authorize middleware
 * - Checks if user's role is in allowed roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied: requires one of roles: [${roles.join(', ')}]`
        )
      );
    }

    next();
  };
};

// /**
//  * Grant access to specific roles
//  */
export const role = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `User role ${req.user.role} is not authorized to access this route`
        )
      );
    }
    next();
  };
};

export const auth = async (req: any, _res: Response, next: NextFunction) => {
  let token;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route'as any));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as { [key: string]: any };

    // Get user from token
// Since 'User' is not found, we assume there's a service similar to the previous part of the code
// Let's use userService to find the user
req.user = await userService.findById(decoded.id);

    next();
  } catch (err) {
    logger.error('JWT verification error:', err);
// Assuming AppError constructor can accept only one argument, adjust accordingly
const error = new AppError('Not authorized to access this route' as any);
return next(error);
  }
};
