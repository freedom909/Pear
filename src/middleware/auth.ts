import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorResponse } from '../utils/errorResponse';
import  User  from '../models/user/user.model';
import  logger from '../utils/logger';

interface JwtPayload {
  id: string;
}

/**
 * Protect routes by verifying JWT token
 */
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
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtPayload;

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (err) {
    logger.error('JWT verification error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

/**
 * Grant access to specific roles
 */
export const role = (...roles: string[]) => {
  return (req: any, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};