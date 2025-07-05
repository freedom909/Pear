import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';
import User from '../models/user/user.model';
import { AppError } from '../errors/appError';
import ErrorCode from '../errors/error-code';
import logger from '../middleware/logger';
import { UserDocument } from '../models/interface';
import { UserRole } from '../models/user/user.types';
import { UserResponseDTO } from '../dtos/userDTO';
import { asyncHandler } from '../middleware/errorHandler';

import jwt from 'jsonwebtoken';
interface AuthRequest extends Request {
  user: UserDocument;
}

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(
        new AppError({
          message: 'User not found',
          code: ErrorCode.NOT_FOUND,
          details: { user: user },
        })
      );
    }
    sendTokenResponse(user, 200, res);
  }
);

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */
export const updateDetails = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );

    sendTokenResponse(updated, 200, res);
  }
);

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = (await User.findById(req.user.id).select(
      '+password'
    )) as UserDocument;
    if (!user) {
      return next(
        new AppError({ message: 'User not found', code: ErrorCode.NOT_FOUND })
      );
    }
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return next(
        new AppError({ message: 'Incorrect password', code: ErrorCode.UNAUTHORIZED })
      );
    }

    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  }
);

/**
 * @desc    Log user out / clear cookies
 * @access  Private
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Clear access token cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  // Clear refresh token cookie
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError({
          message: 'No user with this email exists',
          code: ErrorCode.NOT_FOUND,
          details: { user: user },
        })
      );
    }

    const resetToken = user.getResetPasswordToken() as string;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    logger.info(`Password reset link: ${resetUrl}`);

    res.status(200).json({ success: true, resetUrl }); // Replace with actual mail sender in production
  }
);

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = (await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })) as UserDocument;
    if (!user) {
      return next(
        new AppError({
          message: 'Invalid token',
          code: ErrorCode.BAD_REQUEST,
          details: { user: user },
        })
      );
    }

    user.password = req.body.password; // the business logic is ok?
    user.resetPasswordToken = undefined; //
    user.resetPasswordExpire = undefined; //
    await user.save();

    // sendTokenResponse(user, 200, res);
    return res
      .status(200)
      .json({ success: true, data: new UserResponseDTO(user) });
  }
);

/**
 * ========================
 * ==== OAUTH ROUTES =====
 * ========================
 */


/**
 * Helper to send token in response
 */
export function sendTokenResponse(user: any, statusCode: number, res: Response) {
  const token = user.getSignedJwtToken();
  const refreshToken = generateRefreshToken(user);
  const tokenExpiry = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour from now

  res
    .status(statusCode)
    .cookie('token', token, {
      expires: new Date(Date.now() + 3600000), // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 604800000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ 
      success: true, 
      token,
      refreshToken,
      tokenExpiry
    });
}

/**
 * 🔐 JWT utility helpers
 */
// function generateToken(user: UserDocument): string {
//   return jwt.sign(
//     { id: user._id, email: user.email, role: user.role },
//     process.env.JWT_SECRET || 'secret',
//     { expiresIn: '1h' }
//   );
// }

function generateRefreshToken(user: UserDocument): string {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );
}

/**
 * 🚀 Register new user
 */
export const register = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(
        new AppError({
          message: 'Email already registered',
          code: ErrorCode.EMAIL_ALREADY_REGISTERED,
          details: { userId: existingUser._id }
        })
      );
    }

    const user = (await User.create({
      name,
      email,
      password,
      role: role === UserRole.ADMIN ? UserRole.USER : role,
    })) as unknown as UserDocument;

    sendTokenResponse(user, 201, res);

  } catch (error: any) {
    logger.error('User registration failed:', error);

    // Duplicate key error
    if (error.code === 11000) {
      return next(
        new AppError({
          message: 'Email already registered',
          code: ErrorCode.EMAIL_ALREADY_REGISTERED,
          details: { error: error.message }
        })
      );
    }

    // Other errors
    return next(
      new AppError({
        message: error.message || 'Registration failed',
        code: ErrorCode.REGISTRATION_FAILED,
        details: { error }
      })
    );
  }
})

/**
 * 🔐 Login user
 */
export const login = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(
      new AppError({
        message: 'Please provide email and password',
        code: ErrorCode.BAD_REQUEST,
        details: { email, password }
      })
    );
  }

  const user = (await User.findOne({ email }).select('+password')) as UserDocument;
  
  if (!user || !(await user.comparePassword(password))) {
    return next(
      new AppError({
        message: 'Invalid email or password',
        code: ErrorCode.UNAUTHORIZED,
        details: { email }
      })
    );
  }

  sendTokenResponse(user, 200, res);
});

/**
 * 🔄 Refresh Token
 */
export const refreshToken = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(
      new AppError({
        message: 'Please provide a refresh token',
        code: ErrorCode.BAD_REQUEST,
        details: { refreshToken }
      })
    );
  }

  // Verify refresh token
  let decoded: { id: string };
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as { id: string };
  } catch (error) {
    return next(
      new AppError({
        message: 'Invalid refresh token',
        code: ErrorCode.UNAUTHORIZED,
        details: { error: (error as Error).message }
      })
    );
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError({
        message: 'User not found',
        code: ErrorCode.NOT_FOUND,
        details: { userId: decoded.id },
      })
    );
  }

  sendTokenResponse(user, 200, res);
});