import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {  UserDocument } from '../../models/interface/index';
import User from '../../models/user/user.model';
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
  static async login(req: Request, res: Response, next: NextFunction) : Promise<void>{
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        throw new Error(' email and password are required');
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
        return ApiResponse.success(res, 
          {
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            token,
            refreshToken
          }, 
          200,
        );
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<Response | void>  {
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
      return ApiResponse.success(res, 
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token,
          refreshToken
        }, 
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * @route POST /api/v1/auth/refresh-token
   */
  static async refreshToken(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return ApiResponse.validationError(res, [
          { field: 'refreshToken', message: 'Refresh token is required' }
        ]);
      }

      try {
        jwt.verify(
          refreshToken, 
          process.env.JWT_REFRESH_SECRET || 'refresh-secret'
        ) as any;
      } catch {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }
let decoded;
try {
  decoded = jwt.verify(
    refreshToken, 
    process.env.JWT_REFRESH_SECRET || 'refresh-secret'
  ) as any;
} catch {
  return ApiResponse.unauthorized(res, 'Invalid refresh token');
}
const user = await User.findById(decoded.id);
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }
      const token = AuthController.generateToken(user as UserDocument);
      const newRefreshToken = AuthController.generateRefreshToken(user as UserDocument);
  
      return ApiResponse.success(res, { token, refreshToken: newRefreshToken }, 200);
    } catch (error) {
      next(error); // Only unexpected errors hit this
    }
    return;
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