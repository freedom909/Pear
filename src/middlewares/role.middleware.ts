import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/api-error.util';
import { UserRole } from '../models/User';

/**
 * Role Middleware
 * Handles role-based access control
 */
export class RoleMiddleware {
  /**
   * Check if user has required role
   * @param roles Allowed roles
   */
  static hasRole = (roles: UserRole | UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      try {
        // Check if user exists in request
        if (!req.user) {
          throw new ApiError(401, 'Authentication required');
        }
        
        // Convert single role to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Check if user has required role
        if (!allowedRoles.includes(req.user.role)) {
          throw new ApiError(403, 'Insufficient permissions');
        }
        
        next();
      } catch (error) {
        if (error instanceof ApiError) {
          next(error);
        } else {
          next(new ApiError(403, 'Access denied'));
        }
      }
    };
  };
  
  /**
   * Check if user is admin
   */
  static isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      
      // Check if user is admin
      if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError(403, 'Admin access required');
      }
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(403, 'Access denied'));
      }
    }
  };
  
  /**
   * Check if user is accessing their own resource
   * @param userIdParam Parameter name containing user ID (default: 'userId')
   */
  static isSelfOrAdmin = (userIdParam: string = 'userId') => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      try {
        // Check if user exists in request
        if (!req.user) {
          throw new ApiError(401, 'Authentication required');
        }
        
        // Get resource user ID from request parameters
        const resourceUserId = req.params[userIdParam];
        
        // Allow if user is admin or accessing their own resource
        if (req.user.role === UserRole.ADMIN || req.user._id.toString() === resourceUserId) {
          return next();
        }
        
        throw new ApiError(403, 'Insufficient permissions');
      } catch (error) {
        if (error instanceof ApiError) {
          next(error);
        } else {
          next(new ApiError(403, 'Access denied'));
        }
      }
    };
  };
  
  /**
   * Check if user has verified email
   */
  static isEmailVerified = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      
      // Check if email is verified
      if (!req.user.isEmailVerified) {
        throw new ApiError(403, 'Email verification required');
      }
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(403, 'Access denied'));
      }
    }
  };
}