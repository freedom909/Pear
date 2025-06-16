import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { LoggerConfig } from '../config/logger.config';
import { initiateGoogleAuth } from '../config/google.passport';
import { initiateAppleAuth as startAppleAuth } from '../config/apple.passport';

/**
 * Controller for handling authentication operations
 */
export class AuthController {
  private static authService = new AuthService();

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthController.authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user with email and password
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthController.authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      await AuthController.authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await AuthController.authService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthController.authService.sendVerificationEmail(email);
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      await AuthController.authService.verifyEmail(token);
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate password reset
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthController.authService.forgotPassword(email);
      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthController.authService.resetPassword(token, password);
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate Google authentication
   */
  static initiateGoogleAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      initiateGoogleAuth(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google authentication callback
   */
  static async handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        throw new Error('Google authentication failed');
      }

      // Generate tokens
      const result = await AuthController.authService.googleAuth(user);

      // Set refresh token in cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with access token
      const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      LoggerConfig.error('Google callback error', { error });
      const errorUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
      errorUrl.pathname = '/login';
      errorUrl.searchParams.set('error', 'google-auth-failed');
      res.redirect(errorUrl.toString());
    }
  }

  /**
   * Initiate Apple authentication
   */
  static initiateAppleAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      startAppleAuth(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Apple authentication callback
   */
  static async handleAppleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        throw new Error('Apple authentication failed');
      }

      // Generate tokens
      const result = await AuthController.authService.appleAuth(user);

      // Set refresh token in cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with access token
      const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      LoggerConfig.error('Apple callback error', { error });
      const errorUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
      errorUrl.pathname = '/login';
      errorUrl.searchParams.set('error', 'apple-auth-failed');
      res.redirect(errorUrl.toString());
    }
  }
}

// Export individual methods for route handlers
export const {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  initiateGoogleAuth,
  handleGoogleCallback
} = AuthController;