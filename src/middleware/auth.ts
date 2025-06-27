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

    const user = await userService.getUser(decoded.sub);
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
