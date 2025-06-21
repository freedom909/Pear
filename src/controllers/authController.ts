import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ErrorResponse } from '../utils/errorResponse';
import { asyncHandler } from '../middleware/error';
import  User  from '../models/user/model';
import { LoginResponseDTO, UserResponseDTO } from '../dtos/userDTO';
import { logger } from '../utils/logger';

/**
 * Initiate Google OAuth login
 */
export const googleLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Initiating Google OAuth flow');
    logger.debug('Google OAuth request query:', req.query);
    logger.debug('Google OAuth request session:', req.session);
    
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res, next);
  }
);

/**
 * Google OAuth callback
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Received Google OAuth callback');
    logger.debug('Callback query params:', req.query);
    
    if (!process.env.FRONTEND_URL) {
      logger.error('FRONTEND_URL environment variable not set');
      return next(new ErrorResponse('Server configuration error', 500));
    }

    passport.authenticate(
      'google',
      { session: false },
      (err: Error, user: any, info: any) => {
        if (err) {
          logger.error('Google OAuth authentication error:', err);
          logger.debug('Error details:', { 
            message: err.message,
            stack: err.stack 
          });
          return next(new ErrorResponse('Google authentication failed', 401));
        }

        if (!user) {
          logger.error('Google OAuth failed - no user returned');
          logger.debug('Authentication info:', info);
          return next(new ErrorResponse('Google authentication failed', 401));
        }

        logger.info('Google OAuth successful for user:', user.id);
        
        try {
          // Generate JWT token
          const token = user.getSignedJwtToken();
          logger.debug('Generated JWT token for user');

          // Set cookie with token
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });

          // Redirect to frontend with token
          const redirectUrl = `${process.env.FRONTEND_URL}/oauth?token=${token}`;
          logger.debug('Redirecting to:', redirectUrl);
          res.redirect(redirectUrl);
        } catch (error) {
          logger.error('Error in Google callback processing:', error);
          return next(new ErrorResponse('Authentication processing failed', 500));
        }
      }
    )(req, res, next);
  }
);

/**
 * Get current user from JWT
 */
export const getCurrentUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user),
    });
  }
);

/**
 * Logout user
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);