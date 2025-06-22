import { Request, Response, NextFunction } from 'express';
import  { UserRole } from '../models/interface/index';
import  User  from '../models/user/user.model';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';
import crypto from 'crypto';

/**
 * @desc    注册用户
 * @route   POST /api/v1/auth/register
 * @access  公开
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    // 检查是否已存在相同邮箱的用户
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('该邮箱已被注册', 400));
    }

    // 创建用户
    const user = await User.create({
      name,
      email,
      password,
      role: role === UserRole.ADMIN ? UserRole.USER : role, // 防止直接创建管理员账户
    });

    // 发送响应
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('注册用户失败:', error);
    next(error);
  }
};

/**
 * @desc    用户登录
 * @route   POST /api/v1/auth/login
 * @access  公开
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 验证邮箱和密码
    if (!email || !password) {
      return next(new ErrorResponse('请提供邮箱和密码', 400));
    }

    // 查找用户并包含密码字段
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 发送响应
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('用户登录失败:', error);
    next(error);
  }
};

/**
 * @desc    退出登录 / 清除cookie
 * @route   GET /api/v1/auth/logout
 * @access  私有
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10秒后过期
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error('退出登录失败:', error);
    next(error);
  }
};

/**
 * @desc    获取当前登录用户
 * @route   GET /api/v1/auth/me
 * @access  私有
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 用户已通过auth中间件添加到req对象
    const user = await User.findById((req as any).user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('获取当前用户失败:', error);
    next(error);
  }
};

/**
 * @desc    更新用户详情
 * @route   PUT /api/v1/auth/updatedetails
 * @access  私有
 */
export const updateDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('更新用户详情失败:', error);
    next(error);
  }
};

/**
 * @desc    更新密码
 * @route   PUT /api/v1/auth/updatepassword
 * @access  私有
 */
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById((req as any).user.id).select('+password');

    if (!user) {
      return next(new ErrorResponse('用户不存在', 404));
    }

    // 检查当前密码
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse('密码不正确', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('更新密码失败:', error);
    next(error);
  }
};

/**
 * @desc    忘记密码
 * @route   POST /api/v1/auth/forgotpassword
 * @access  公开
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('没有使用该邮箱的用户', 404));
    }

    // 获取重置令牌
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // 创建重置URL
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `您收到此电子邮件是因为您（或其他人）请求重置密码。请访问以下链接重置密码：\n\n${resetUrl}`;

    try {
      // 在实际应用中，这里应该发送电子邮件
      // await sendEmail({
      //   email: user.email,
      //   subject: '密码重置令牌',
      //   message,
      // });

      // 由于这是示例，我们只记录消息
      logger.info(`重置密码邮件内容: ${message}`);

      res.status(200).json({
        success: true,
        data: '电子邮件已发送',
        // 在开发环境中返回令牌，方便测试
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      });
    } catch (err) {
      logger.error('发送电子邮件失败:', err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('无法发送电子邮件', 500));
    }
  } catch (error) {
    logger.error('忘记密码处理失败:', error);
    next(error);
  }
};

/**
 * @desc    重置密码
 * @route   PUT /api/v1/auth/resetpassword/:resettoken
 * @access  公开
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 获取哈希令牌
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('无效的令牌', 400));
    }

    // 设置新密码
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('重置密码失败:', error);
    next(error);
  }
};

/**
 * 获取令牌并创建cookie
 */
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  // 创建令牌
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE as unknown as number) || 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
    });
};