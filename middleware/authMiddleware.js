import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import dbConnect from '../utils/dbConnect';

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user to request object
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Function} next - Function to call next middleware or handler
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await dbConnect();

    // Get user from database (exclude password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * Must be used after protect middleware
 * 
 * @param  {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Auth middleware error: User not found in request'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

/**
 * Helper function to use middleware in Next.js API routes
 * 
 * @param {Function} middleware - Middleware function to run
 */
export const runMiddleware = (middleware) => {
  return (req, res) => {
    return new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  };
};