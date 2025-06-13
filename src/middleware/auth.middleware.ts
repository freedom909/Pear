import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { ApiError } from '../utils/api-error.util';
import { User, UserDocument } from '../models/User';
import mongoose from 'mongoose';

/**
 * Authentication Middleware
 * Handles JWT authentication and authorization
 */
export class AuthMiddleware {
  /**
   * Authenticate user using JWT
   * Extracts token from Authorization header and verifies it
   */
  static authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Authentication required'));
      }

      // Extract token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return next(new ApiError(401, 'Authentication required'));
      }

      // Verify token
      const payload: any = JwtUtil.verifyAccessToken(token);
      if (!payload) {
        return next(new ApiError(401, 'Invalid or expired token'));
      }

      // Find user
      const user = await User.findById(payload.id);
      if (!user) {
        return next(new ApiError(401, 'User not found'));
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return next(new ApiError(401, 'Authentication failed'));
    }
  };

  /**
   * Check if user has required role
   * @param roles Array of allowed roles
   */
  static hasRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Ensure user is authenticated
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required'));
      }

      const user = req.user as UserDocument;
      const userRole = user.role || 'user';

      // Check if user has required role
      if (!roles.includes(userRole)) {
        return next(new ApiError(403, 'Insufficient permissions'));
      }

      next();
    };
  };

  /**
   * Check if user is admin
   */
  static isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Ensure user is authenticated
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const user = req.user as UserDocument;
    const userRole = user.role || 'user';

    // Check if user is admin
    if (userRole !== 'admin') {
      return next(new ApiError(403, 'Admin access required'));
    }

    next();
  };

  /**
   * Check if user owns the resource
   * @param resourceModel Mongoose model
   * @param resourceIdParam Parameter name containing resource ID
   * @param userIdField Field name in resource that contains user ID
   */
  static isResourceOwner = (
    resourceModel: mongoose.Model<any>,
    resourceIdParam: string = 'id',
    userIdField: string = 'userId'
  ) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Ensure user is authenticated
        if (!req.user) {
          return next(new ApiError(401, 'Authentication required'));
        }

        const user = req.user as UserDocument;
        const resourceId = req.params[resourceIdParam];

        // Validate resource ID
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
          return next(new ApiError(400, 'Invalid resource ID'));
        }

        // Find resource
        const resource = await resourceModel.findById(resourceId);
        if (!resource) {
          return next(new ApiError(404, 'Resource not found'));
        }

        // Check if user is admin (admins can access any resource)
        if (user.role === 'admin') {
          return next();
        }

        // Check if user owns the resource
        const resourceUserId = resource[userIdField]?.toString();
        const userId = user._id.toString();

        if (resourceUserId !== userId) {
          return next(new ApiError(403, 'You do not have permission to access this resource'));
        }

        next();
      } catch (error) {
        return next(new ApiError(500, 'Error checking resource ownership'));
      }
    };
  };

  /**
   * Check if email is verified
   */
  static isEmailVerified = (req: Request, res: Response, next: NextFunction) => {
    // Ensure user is authenticated
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const user = req.user as UserDocument;

    // Check if email is verified
    if (!user.emailVerified) {
      return next(new ApiError(403, 'Email verification required'));
    }

    next();
  };
}