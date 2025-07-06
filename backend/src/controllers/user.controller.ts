// controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';

import { asyncHandler } from '../middleware/asyncHandler';
import User from '../models/user/user.model';
import { UserRole } from '../models/interface/index';
import { validateRequest } from '../validators/validateRequest';
import { UpdateUserDTO } from '../dtos/userDTO';
import { AuthRequest } from '@/middleware/auth';

// 用户数据脱敏函数
const sanitizeUserData = (user: any) => {
  if (!user) {
    return user;
  }

  // 创建用户数据的副本
  const sanitized = user.toObject ? user.toObject() : { ...user };

  // 脱敏邮箱
  if (sanitized.email) {
    const [localPart, domain] = sanitized.email.split('@');
    sanitized.email = `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;
  }

  // 脱敏手机号码
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(
      /^(\d{3})\d{4}(\d{4})$/,
      '$1****$2'
    );
  }

  // 脱敏身份证号
  if (sanitized.idNumber) {
    sanitized.idNumber = sanitized.idNumber.replace(
      /^(\d{6})\d{8}(\d{4})$/,
      '$1********$2'
    );
  }

      // 保留必要的认证信息
      const preservedFields = [
        '_id',
        'id',
        'username',
        'role',
        'permissions',
        'createdAt',
        'updatedAt',
        'avatar'
      ];
  preservedFields.forEach((field) => {
    if (user[field]) {
      if (field === 'avatar' && user[field]) {
        // Convert avatar path to absolute URL
        sanitized[field] = `http://localhost:5000${user[field]}`;
      } else {
        sanitized[field] = user[field];
      }
    }
  });

  return sanitized;
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getMe = asyncHandler<AuthRequest>(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return next(
        new AppError({
          message: 'User not found',
          code: ErrorCode.NOT_FOUND,
          details: { user: user },
        })
      );
    }

    res.status(200).json({
      success: true,
      data: sanitizeUserData(user),
    });
  }
);

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateMe = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const dto = (await validateRequest(UpdateUserDTO)(req, res, next)) as any;
    if (!dto) {
      return;
    }

    const updateData: any = {};
    if (dto.name) {
      updateData.name = dto.name;
    }
    if (dto.email) {
      const existingUser = await User.findOne({
        email: dto.email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return next(
          new AppError({
            message: 'Email is already taken',
            code: ErrorCode.BAD_REQUEST,
            details: { user: existingUser },
          })
        );
      }
      if (dto.email === req.user.email) {
        return next(
          new AppError({
            message: 'Email is already taken',
            code: ErrorCode.BAD_REQUEST,
          })
        );
      }
      if (dto.email !== req.user.email) {
        return next(
          new AppError({
            message: 'Email is already taken',
            code: ErrorCode.BAD_REQUEST,
          })
        );
      }
    }

    if (dto.role) {
      if (dto.role === UserRole.ADMIN) {
        return next(
          new AppError({
            message: 'Cannot change role to admin',
            code: ErrorCode.BAD_REQUEST,
            details: { user: req.user },
          })
        );
      }
      updateData.email = dto.email;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      limit,
      data: users,
    });
  }
);

/**
 * @desc    Get a single user by ID (admin only)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(
        new AppError({
          message: `User with ID ${req.params.id} not found`,
          code: ErrorCode.NOT_FOUND,
          details: { user: user },
        })
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * @desc    Create user (admin only)
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  }
);

/**
 * @desc    Update user by ID (admin only)
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new AppError({
          message: `User with ID ${req.params.id} not found`,
          code: ErrorCode.NOT_FOUND,
          details: { user: req.user },
        })
      );
    }

    res.status(200).json({ success: true, data: user });
  }
);

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.user.id === req.params.id) {
      return next(
        new AppError({
          message: 'Cannot delete your own account',
          code: ErrorCode.BAD_REQUEST,
          details: { user: req.user },
        })
      );
    }

    if (req.user.role === UserRole.ADMIN) {
      return next(
        new AppError({
          message: 'Cannot change your own role',
          code: ErrorCode.BAD_REQUEST,
          details: { user: req.user },
        })
      );
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(
        new AppError({
          message: `User with ID ${req.params.id} not found`,
          code: ErrorCode.NOT_FOUND,
          details: { user: req.user },
        })
      );
    }

    res.status(200).json({ success: true, data: {} });
  }
);

/**
 * @desc    Change user role (admin only)
 * @route   PUT /api/v1/users/:id/role
 * @access  Private/Admin
 */
export const changeUserRole = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return next(
        new AppError({
          message: 'Invalid role',
          code: ErrorCode.BAD_REQUEST,
          details: { role },
        })
      );
    }

    if (role === UserRole.ADMIN) {
      return next(
        new AppError({
          message: 'Cannot change role to admin',
          code: ErrorCode.BAD_REQUEST,
          details: { role },
        })
      );
    }

    if (req.user.id === req.params.id) {
      return next(
        new AppError({
          message: 'Cannot change your own role',
          code: ErrorCode.BAD_REQUEST,
          details: { role },
        })
      );
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return next(
        new AppError({
          message: `User with ID ${req.params.id} not found`,
          code: ErrorCode.NOT_FOUND,
          details: { user: req.user },
        })
      );
    }

    res.status(200).json({ success: true, data: user });
  }
);