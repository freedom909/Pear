import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../../models/User';
import { ApiResponse } from '../../utils/api-response.util';

/**
 * Auth API Controller
 * Handles authentication-related API requests
 */
export class AuthController {
  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return ApiResponse.validationError(res, [
          { field: !email ? 'email' : 'password', message: 'Required field missing' }
        ]);
      }
      
      // Authenticate user
      passport.authenticate('local', { session: false }, (err: Error, user: UserDocument, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return ApiResponse.unauthorized(res, info?.message || 'Invalid email or password');
        }
        
        // Generate JWT token
        const token = AuthController.generateToken(user);
        const refreshToken = AuthController.generateRefreshToken(user);
        
        // Return user and token
        return ApiResponse.success(res, {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token,
          refreshToken
        }, 'Login successful');
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      
      // Validate input
      const validationErrors = [];
      if (!name) validationErrors.push({ field: 'name', message: 'Name is required' });
      if (!email) validationErrors.push({ field: 'email', message: 'Email is required' });
      if (!password) validationErrors.push({ field: 'password', message: 'Password is required' });
      if (password && password.length < 8) {
        validationErrors.push({ field: 'password', message: 'Password must be at least 8 characters' });
      }
      
      if (validationErrors.length > 0) {
        return ApiResponse.validationError(res, validationErrors);
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.validationError(res, [
          { field: 'email', message: 'Email is already registered' }
        ]);
      }
      
      // Create new user
      const user = new User({
        name,
        email,
        password
      });
      
      await user.save();
      
      // Generate JWT token
      const token = AuthController.generateToken(user);
      const refreshToken = AuthController.generateRefreshToken(user);
      
      // Return user and token
      return ApiResponse.success(res, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token,
        refreshToken
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * @route POST /api/v1/auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return ApiResponse.validationError(res, [
          { field: 'refreshToken', message: 'Refresh token is required' }
        ]);
      }
      
      // Verify refresh token
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;
        
        // Find user
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return ApiResponse.unauthorized(res, 'Invalid refresh token');
        }
        
        // Generate new tokens
        const token = AuthController.generateToken(user);
        const newRefreshToken = AuthController.generateRefreshToken(user);
        
        return ApiResponse.success(res, {
          token,
          refreshToken: newRefreshToken
        }, 'Token refreshed successfully');
      } catch (error) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(user: UserDocument): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate refresh token
   */
  private static generateRefreshToken(user: UserDocument): string {
    return jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );
  }
}