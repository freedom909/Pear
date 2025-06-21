import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { asyncHandler } from '../middleware/error';
import User, { UserRole } from '../models/user/model';
import { 
  RegisterUserDTO, 
  LoginUserDTO, 
  UpdateUserDTO, 
  UpdatePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  UserResponseDTO,
  LoginResponseDTO
} from '../dtos/userDTO';
import { validateRequest } from '../middleware/validateRequest';
import  logger  from '../utils/logger';
import { auth } from '../middleware/auth';
import emailService from '../utils/email';

/**
 * 注册用户
 */
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(RegisterUserDTO)(req, res, next);
    if (!dto) return;

    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      return next(new ErrorResponse('该邮箱已被注册', 400));
    }

    // 创建用户
    const user = await User.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role || UserRole.USER
    });

    // 发送欢迎邮件
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      logger.error('发送欢迎邮件失败:', error);
    }

    // 生成JWT令牌
    const token = user.getSignedJwtToken();

    // 返回响应
    res.status(201).json({
      success: true,
      data: new LoginResponseDTO(token, user)
    });
  }
);

/**
 * 用户登录
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(LoginUserDTO)(req, res, next);
    if (!dto) return;

    // 检查用户是否存在
    const user = await User.findOne({ email: dto.email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 验证密码
    const isMatch = await user.matchPassword(dto.password);
    if (!isMatch) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 生成JWT令牌
    const token = user.getSignedJwtToken();

    // 返回响应
    res.status(200).json({
      success: true,
      data: new LoginResponseDTO(token, user)
    });
  }
);

/**
 * 获取当前用户信息
 */
export const getMe = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user)
    });
  }
);

/**
 * 更新用户信息
 */
export const updateUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(UpdateUserDTO)(req, res, next);
    if (!dto) return;

    const fieldsToUpdate = {
      name: dto.name,
      email: dto.email,
      avatar: dto.avatar
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user)
    });
  }
);

/**
 * 更新密码
 */
export const updatePassword = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(UpdatePasswordDTO)(req, res, next);
    if (!dto) return;

    const user = await User.findById(req.user.id).select('+password');

    // 验证当前密码
    const isMatch = await user.matchPassword(dto.currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('当前密码不正确', 401));
    }

    user.password = dto.newPassword;
    await user.save();

    // 生成新的JWT令牌
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: new LoginResponseDTO(token, user)
    });
  }
);

/**
 * 忘记密码
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(ForgotPasswordDTO)(req, res, next);
    if (!dto) return;

    const user = await User.findOne({ email: dto.email });

    if (!user) {
      return next(new ErrorResponse('该邮箱未注册', 404));
    }

    // 生成重置令牌
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // 创建重置URL
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    try {
      // 发送密码重置邮件
      await emailService.sendPasswordReset(user.email, resetUrl);

      res.status(200).json({
        success: true,
        data: '密码重置邮件已发送'
      });
    } catch (err) {
      logger.error('发送密码重置邮件失败:', err);

      // 重置令牌和过期时间
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('邮件发送失败', 500));
    }
  }
);

/**
 * 重置密码
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(ResetPasswordDTO)(req, res, next);
    if (!dto) return;

    // 获取哈希后的令牌
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('无效的令牌或令牌已过期', 400));
    }

    // 设置新密码
    user.password = dto.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 发送密码重置确认邮件
    try {
      await emailService.sendPasswordResetConfirmation(user.email);
    } catch (error) {
      logger.error('发送密码重置确认邮件失败:', error);
    }

    // 生成JWT令牌
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: new LoginResponseDTO(token, user)
    });
  }
);

/**
 * 获取所有用户 (管理员)
 */
export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => new UserResponseDTO(user))
    });
  }
);

/**
 * 获取单个用户 (管理员)
 */
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`找不到ID为${req.params.id}的用户`, 404));
    }

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user)
    });
  }
);

/**
 * 更新用户 (管理员)
 */
export const updateUserAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 验证请求数据
    const dto = await validateRequest(UpdateUserDTO)(req, res, next);
    if (!dto) return;

    const user = await User.findByIdAndUpdate(req.params.id, dto, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new ErrorResponse(`找不到ID为${req.params.id}的用户`, 404));
    }

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user)
    });
  }
);

/**
 * 删除用户 (管理员)
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`找不到ID为${req.params.id}的用户`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  }
);