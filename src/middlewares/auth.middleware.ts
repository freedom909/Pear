import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../config';
import { jwtConfig } from '../config';
import { UserRole } from '../models';
import { TokenService } from '../services';

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    // Get token
    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = await TokenService.verifyAccessToken(token);

    // Add user to request
    req.user = payload;

    next();
  } catch (error) {
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorization middleware
 * @param roles Allowed roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Extend Express Request interface
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}