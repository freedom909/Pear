import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { UserDocument } from '@/models/user/user.types';

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Extend Express Request interface to include user


/**
 * Middleware to protect routes that require authentication
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader?.split(' ')[1];
    if (!token) {
       res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    // Verify token
    const decoded = jwt.verify(token as string, JWT_SECRET) as unknown as{ id: string };
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
       res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Attach user to request object
    req.user = user as unknown as UserDocument;
    req.user.id = user?._id as unknown as string;
    
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    
    if ((error as Error).name === 'JsonWebTokenError') {
       res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Middleware to check if user is an admin
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authorization.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // If no token, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    // If user found, attach to request
    if (user) {
      req.user = user as unknown as UserDocument;
      req.user.id = user._id as unknown as string;
    }
    
    next();
  } catch (error) {
    // For optional auth, just log the error and continue without authentication
    logger.debug('Optional authentication failed', error);
    next();
  }
};