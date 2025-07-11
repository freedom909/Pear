// auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user/user.model';
import { AppError } from '../errors/appError';
import ErrorCode from '../errors/error-code';
import logger from '../middleware/logger';
import { UserDocument } from '../models/user/user.types';
import { UserResponseDTO } from '../dtos/userDTO';
import { asyncHandler } from '../middleware/asyncHandler';
import userService from '../services/user.service';

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}


/**
 * 🚀 Register new user
 */
export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // 1) Validate input
    if (!name || !email || !password || !passwordConfirm) {
      return next(new AppError({
        message: 'Please provide all required fields',
        code: ErrorCode.BAD_REQUEST,
        details: { name, email, password, passwordConfirm },
      }));
    }

    if (!validator.isEmail(email)) {
      return next(new AppError({
        message: 'Please provide a valid email',
        code: ErrorCode.BAD_REQUEST,
        details: { email },
      }));
    }

    if (password !== passwordConfirm) {
      return next(new AppError({
        message: 'Passwords do not match',
        code: ErrorCode.BAD_REQUEST,
        details: { password, passwordConfirm },
      }));
    }

    if (password.length < 8) {
      return next(new AppError({
        message: 'Password must be at least 8 characters',
        code: ErrorCode.BAD_REQUEST,
        details: { password },
      }));
    }

    // 2) Check if user already exists
    const existingUser = await userService.findOne({ email });
    if (existingUser) {
      return next(new AppError({
        message: 'Email already in use',
        code: ErrorCode.BAD_REQUEST,
        details: { email },
      }));
    }

    // 3) Create new user
    const newUser = await userService.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      provider: 'local',
      accessToken: '',
      refreshToken: '',
      profile: {},
      avatar: '',
    });

    // 4) Generate JWT token
    const token = createToken(newUser._id as string);

    // 5) Send response
    res.status(201).json({
      success: true,
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 🔐 Login user
 */
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError({
      message: 'Please provide email and password',
      code: ErrorCode.BAD_REQUEST,
      details: { email, password },
    }));
  }

  const user = (await User.findOne({ email }).select('+password')) as UserDocument;

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError({
      message: 'Invalid email or password',
      code: ErrorCode.UNAUTHORIZED,
      details: { email },
    }));
  }

  sendTokenResponse(user, 200, res);
});

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
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

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
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, data: new UserResponseDTO(user) });
});

/**
 * 🚪 Logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie('token', 'none', {
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
 * Helper to create JWT
 */
function createToken(id: string): string {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secure-random-string-here', { expiresIn: '1h' });
}

/**
 * Helper to send token response
 */
function sendTokenResponse(user: UserDocument, statusCode: number, res: Response) {
  const token = user.getSignedJwtToken();
  const refreshToken = generateRefreshToken(user);
  const tokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60;

  res
    .status(statusCode)
    .cookie('token', token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ success: true, token, refreshToken, tokenExpiry });
}

function generateRefreshToken(user: UserDocument): string {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'another-secure-random-string-here', { expiresIn: '7d' });
}
