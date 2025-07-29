// auth.controller.ts

import dot from 'dotenv';
dot.config();
import 'reflect-metadata'; 
import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import User from '../models/user/user.model';
import { AppError } from '../errors/appError';
import ErrorCode from '../errors/error-code';
import logger from '../middleware/logger';
import { UserDocument } from '../models/user/user.types';
import { UserResponseDTO } from '../dtos/userDTO';
import { asyncHandler } from '../middleware/asyncHandler';

import { sendTokenResponse } from '../middleware/sendTokenResponse';
import { verifyToken } from '../middleware/jwt';
// import UserService from '@/services/user.service';
import { container } from 'tsyringe';
//import { UserRepository } from '@/repositories/user.repository';
import { AuthRepository } from '@/repositories/auth.repository';
// import { passwordValidator } from '@/validators/password.validator';
import { EmailValidator } from '@/validators/email.validator';
import { createUserSchema } from '@/validators/user.validator';
import { passwordValidator } from '@/validators/password.validator';
import UserService from '@/services/user.service';


interface RegisterRequestBody {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const jwtSecret = process.env.JWT_SECRET || 'another-secure-random-string-here';
const authRepository = container.resolve(AuthRepository);
const userService=container.resolve(UserService)
// const userService = container.resolve(UserService);
export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {

  const { firstname, lastname, email, password} = req.body;
  try {
    const { error } = createUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(
        new AppError({
          message: error.details[0].message,
          code: ErrorCode.BAD_REQUEST,
        })
      );
    }

    
    // Continue creating user
    const user = await authRepository.registerUser({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      password,
    });
    // Send response
    return res.status(201).json({
      success: true,
      data: new UserResponseDTO(user),
    });
  } catch (error) {
    logger.error(error);
    return next(new AppError({
      message: '注册失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: { error: (error as Error).message },
    }));
  }
};
/**
 * 🔐 Login user
 */

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  console.log('Login route hit:', req.body);
  logger.debug('Login attempt:', { email });

  // Set timeout for the request (10 seconds)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, message: 'Request timeout' });
    }
  }, 10000);

  try {
    if (!email || !password) {
      clearTimeout(timeout);
      logger.debug('Login failed: Missing email or password');
      return next(new AppError({
        message: 'Please enter email and password',
        code: ErrorCode.BAD_REQUEST,
      }));
    }

    EmailValidator.validate(email);
    const validationChains = passwordValidator();
    for (const chain of validationChains) {
      if (typeof chain === 'function') {
        await new Promise((resolve, reject) => {
          chain(req, res, (err) => {
            if (err) reject(err);
            else resolve(null);
          });
        });
      }
    }
    logger.debug('Validating user credentials...');
    const user = await userService.findUserByEmail(email);
    logger.debug('Starting password comparison...', { userId: (user._id as unknown as string).toString() } );
    const isMatch = await user.comparePassword(password);
    logger.debug('Password comparison result:', { isMatch });
    if (!isMatch) {
      logger.debug('Login failed: Invalid credentials');
      return next(new AppError({
        message: 'Invalid credentials',
        code: ErrorCode.UNAUTHORIZED,
      }));
    }

    logger.debug('User authenticated, generating JWT...');
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: '7d',
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    clearTimeout(timeout);
    logger.debug('Login successful');
   return res.status(200).json({ 
  message: 'Login successful', 
  user: new UserResponseDTO(user), 
  token 
});


  } catch (error) {
    clearTimeout(timeout);
    logger.error('Login error:', {
      error:( error as unknown as Error).message,
      stack: (error as unknown as Error).stack,
      input: { email }
    });
    return next(new AppError({
      message: '登录失败',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: { error: (error as Error).message },
    }));
  }
};




/**
 * 🔄 Refresh Token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError({
      message: 'Please provide a refresh token',
      code: ErrorCode.BAD_REQUEST,
      details: { refreshToken },
    }));
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'another-secure-random-string-here'
    ) as { id: string };
  } catch (error) {
    return next(new AppError({
      message: 'Invalid refresh token',
      code: ErrorCode.UNAUTHORIZED,
      details: { error: (error as Error).message },
    }));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError({
      message: 'User not found',
      code: ErrorCode.NOT_FOUND,
      details: { id: decoded.id },
    }));
  }

  sendTokenResponse(user as unknown as UserDocument, 200, res);
});

/**
 * 🏷️ Update user details
 */
export const updateDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    return next(new AppError({
      message: 'User not authenticated',
      code: ErrorCode.UNAUTHORIZED,
    }));
  }

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }) as UserDocument;

  if (!user) {
    return next(new AppError({
      message: 'User not found',
      code: ErrorCode.NOT_FOUND,
    }));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
/**
 * 🔒 Update password
 */
export const updatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError({
      message: 'User not authenticated',
      code: ErrorCode.UNAUTHORIZED,
    }));
  }
  const user = (await User.findById(req.user.id).select('+password')) as UserDocument;

  if (!user) {
    return next(new AppError({
      message: 'User not found',
      code: ErrorCode.NOT_FOUND,
    }));
  }

  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new AppError({
      message: 'Incorrect password',
      code: ErrorCode.UNAUTHORIZED,
    }));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

/**
 * 📨 Forgot password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError({
      message: 'No user with this email exists',
      code: ErrorCode.NOT_FOUND,
      details: { email: req.body.email },
    }));
  }

  // The variable resetToken was declared inside an if block, making it out of scope here.
  // We need to move the resetToken declaration outside the if block.
  let resetToken: string;
  if ('getResetPasswordToken' in user) {
    resetToken = (user as any).getResetPasswordToken() as string;
  } else {
    throw new Error('getResetPasswordToken method does not exist on user object');
  }
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
  logger.info(`Password reset link: ${resetUrl}`);

  res.status(200).json({ success: true, resetUrl });
});

/**
 * 🔁 Reset password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const resetPasswordToken = req.params.resetPasswordToken;

  const user = (await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })) as UserDocument;

  if (!user) {
    return next(new AppError({
      message: 'Invalid token',
      code: ErrorCode.BAD_REQUEST,
    }));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  await user.save();

  res.status(200).json({ success: true, data: new UserResponseDTO(user) });
});



/**
 * 🚪 Logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie('auth_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});



/**
 * Helper to send token response
 */

export const oauthCallbackHandler = (provider: 'facebook' | 'google') =>
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const redirectUri = (req.session as any)?.redirectUri || `${process.env.FRONTEND_URL}/oauth/${provider}-callback`;

      if (req.session) delete (req.session as any).redirectUri;

      const token = user.getSignedJwtToken();
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append('token', token);

      logger.info(`${provider} auth success`, { userId: user._id });
      res.redirect(redirectUrl.toString());
    } catch (err) {
      logger.error(`${provider} callback error`, err);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?code=server_error`);
    }
  };



export const checkStatus = async (req: Request, res: Response) => { 
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      logger.debug('Auth status check failed: Missing token');
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Missing authentication token' 
      });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.debug('Auth status check failed: User not found');
      return res.status(401).json({ 
        authenticated: false, 
        error: 'User not found' 
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        name: {
          firstname: user.firstname,
          
          lastname: user.lastname,
          
        },
      },
    });
  } catch (err) {
    logger.error('Auth status check failed:', {
      error: (err as Error).message,
      stack: (err as Error).stack,
      token: req.cookies.auth_token || req.headers.authorization// is anyting wrong?
    });
    if ((err as unknown as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Invalid token format' 
      });
    }
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Internal server error' 
    });
  }
}
   