import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { BadRequestError, ErrorCode } from '../config/error.config';
import { LoggerConfig } from '../config/logger.config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config/app.config';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const tokens = await authService.register({
        email,
        password,
        firstName,
        lastName
      });
      
      res.status(201).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const tokens = await authService.login(email, password);
      
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Refresh token is required'
        );
      }
      
      const tokens = await authService.refreshToken(refreshToken);
      
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new BadRequestError(
          ErrorCode.VALIDATION_ERROR,
          'Refresh token is required'
        );
      }
      
      await authService.logout(refreshToken);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      await authService.logoutAll(userId);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initialize Google authentication
   */
  initiateGoogleAuth(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('google', {
      scope: [
        'profile',
        'email'
      ],
      accessType: 'offline',
      prompt: 'consent'
    })(req, res, next);
  }

  /**
   * Handle Google authentication callback
   */
  handleGoogleCallback(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('google', { session: false }, async (err, profile) => {
      try {
        if (err) {
          throw err;
        }
        
        if (!profile) {
          throw new BadRequestError(
            ErrorCode.INVALID_CREDENTIALS,
            'Failed to authenticate with Google'
          );
        }
        
        const tokens = await authService.googleAuth(profile);
        
        // Redirect to frontend with tokens
        const redirectUrl = new URL(config.frontendUrl + '/auth/callback');
        redirectUrl.searchParams.set('access_token', tokens.accessToken);
        redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);
        
        res.redirect(redirectUrl.toString());
      } catch (error) {
        LoggerConfig.error('Google authentication error', { error });
        
        // Redirect to frontend with error
        const redirectUrl = new URL(config.frontendUrl + '/auth/callback');
        redirectUrl.searchParams.set('error', 'Authentication failed');
        
        res.redirect(redirectUrl.toString());
      }
    })(req, res, next);
  }
}

// Export singleton instance
export const authController = new AuthController();