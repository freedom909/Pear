import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ErrorResponse } from '../../utils/errorResponse';
import { sendTokenResponse } from '../../utils/auth';
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
      return next(new ErrorResponse('Authentication error', 500));
    }

    if (!user) {
      logger.info('Login failed', { message: info.message });
      return next(new ErrorResponse(info.message || 'Invalid credentials', 401));
    }

    logger.info('User logged in successfully', { userId: user.id });
    sendTokenResponse(user, 200, res);
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
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Create user
    const user = await req.app.locals.userService.createUser({
      email,
      password,
      name,
    });

    logger.info('User registered successfully', { userId: user.id });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Error in user registration', { error });
    next(error);
  }
};