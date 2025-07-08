import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppError } from '../../errors/appError';
import ErrorCode from '../../errors/error-code';
import {sendTokenResponse} from '../../middleware/sendTokenResponse';
import logger from '../../middleware/logger';

/**
 * @desc    Login user using local strategy
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const localLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      logger.error('Error in local authentication', { error: err });
      return next(new AppError({
        message: 'Authentication error', code: ErrorCode.INTERNAL_SERVER_ERROR, details: err }));
    }

    if (err || !user) {
      logger.info('Login failed', { message: info.message });
      return next(new AppError({
        message: 'Invalid credentials',
        code: ErrorCode.UNAUTHORIZED,
        details: info.message,
      }));
    }

    if (!user) {
      logger.info('Login failed', { message: info.message });
      return next(new AppError({
        message: 'Invalid credentials',
        code: ErrorCode.UNAUTHORIZED,
        details: info.message,
      }));
    }

    logger.info('User logged in successfully', { userId: user.id });
    sendTokenResponse(res, 200, user);
  })(req, res, next);
};

/**
 * @desc    Register user using local strategy
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const localRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return next(new AppError({
        message: 'Please provide all required fields',
        code: ErrorCode.BAD_REQUEST,
        details: 'Missing required fields',
      }));
    }

    // Create user
    const user = await req.app.locals.userService.createUser({
      email,
      password,
      name,
    });

    logger.info('User registered successfully', { userId: user.id });
    sendTokenResponse(user, 201, res as any);
  } catch (error) {
    logger.error('Error in user registration', { error });
    next(error);
  }
};