import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import User from '../models/user/user.model';
import { AppError } from '../errors/appError';
import ErrorCode from '@/errors/error-code';
import logger from '../middleware/logger';
import { UserDocument, UserRole } from '../models/interface';
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
    if (!user) return next(new AppError({
      message: '用户不存在',
      code: ErrorCode.NOT_FOUND,
      details: { user: user }
    }));
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
    const user = await User.findById(req.user.id).select('+password') as UserDocument
    if (!user) return next(new AppError({ message: '用户不存在', code: ErrorCode.NOT_FOUND }));
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return next(new AppError({ message: '密码不正确', code: ErrorCode.UNAUTHORIZED }));

    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);

  }
);

/**
 * @desc    Log user out / clear cookie
 * @access  Private
 */
export const logout = asyncHandler(
  async (_req: Request, res: Response) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
  }
);

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError(
      {
        message: '没有使用该邮箱的用户',
        code: ErrorCode.NOT_FOUND,
        details: { user: user }
      }));

    const resetToken = user.getResetPasswordToken() as string;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    logger.info(`重置密码链接: ${resetUrl}`);

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
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } }) as UserDocument;
    if (!user) return next(new AppError({
      message: '无效的令牌',
      code: ErrorCode.BAD_REQUEST,
      details: { user: user }
    }));

    user.password = req.body.password;// the business logic is ok?
    user.resetPasswordToken = undefined;// 
    user.resetPasswordExpire = undefined;// 
    await user.save();

    // sendTokenResponse(user, 200, res);
    return res.status(200).json({ success: true, data: new UserResponseDTO(user) });// how to hide password?
  }
);

/**
 * ========================
 * ==== OAUTH ROUTES =====
 * ========================
 */

/**
 * @desc    Initiate Google OAuth login
 * @route   GET /api/v1/auth/google
 * @access  Public
 */
export const googleLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  }
);

/**
 * @desc    Google OAuth callback
 * @route   GET /api/v1/auth/google/callback
 * @access  Public
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err, user, _info) => {
      if (err || !user) return next(new AppError({
        message: 'Google OAuth authentication failed',
        code: ErrorCode.UNAUTHORIZED,
        details: { user: user }
      }));
      const token = user.getSignedJwtToken();
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.redirect(`${process.env.FRONTEND_URL}/oauth?token=${token}`);
    })(req, res, next);
  }
);

/**
 * Helper to send token in response
 */
function sendTokenResponse(user: any, statusCode: number, res: Response) {
  const token = user.getSignedJwtToken();
  res.status(statusCode)
    .cookie('token', token, {
      expires: new Date(
        Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ success: true, token });
}

/**
 * 🔐 JWT utility helpers
 */
function generateToken(user: UserDocument): string {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

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
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return next(new AppError(
      {
        message: '该邮箱已被注册',
        code: ErrorCode.BAD_REQUEST,
        details: { user: existingUser }
      }));
    const user = await User.create({ name, email, password, role: role === UserRole.ADMIN ? UserRole.USER : role }) as unknown as UserDocument;

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ success: true, token, refreshToken, user });
  } catch (error) {
    logger.error('注册用户失败:', error);
    next(error);
  }
};

/**
 * 🔐 Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError({
      message: '请提供邮箱和密码',
      code: ErrorCode.BAD_REQUEST,
      details: { user: { email, password } }
    }));


    const user = await User.findOne({ email }).select('+password') as UserDocument;
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError({
        message: '无效的凭据',
        code: ErrorCode.BAD_REQUEST,
        details: { user: { email, password } }
      }));
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ success: true, token, refreshToken, user });
  } catch (error) {
    logger.error('用户登录失败:', error);
    next(error);
  }
};

/**
 * 🔄 Refresh Token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError({
        message: '需要提供 refreshToken',
        code: ErrorCode.BAD_REQUEST,
        details: { refreshToken }
      }));
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as { id: string };
    } catch {
      return next(new AppError({
        message: '无效的 refresh token',
        code: ErrorCode.BAD_REQUEST,
        details: { refreshToken }
      }));
    }

    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError({
        message: '无效的 refresh token',
        code: ErrorCode.BAD_REQUEST,
        details: { refreshToken }
      }));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('刷新令牌失败:', error);
    next(error);
  }
};


