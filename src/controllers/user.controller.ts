// controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { asyncHandler } from '../middleware/error';
import User from '../models/user/user.model';
import { UserRole } from '../models/interface/index';
import { validateRequest } from '../middleware/validateRequest';
import {
  UpdateUserDTO,
} from '../dtos/userDTO';


/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
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
    const dto = await validateRequest(UpdateUserDTO)(req, res, next) as any;
    if (!dto) return;

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) {
      const existingUser = await User.findOne({ email: dto.email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return next(new ErrorResponse('Email is already taken', 400));
      }
      updateData.email = dto.email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true })
      .select('-password');

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
      return next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404));
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
      return next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404));
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
      return next(new ErrorResponse('Cannot delete your own account', 400));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404));
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
      return next(new ErrorResponse('Invalid role', 400));
    }

    if (req.user.id === req.params.id) {
      return next(new ErrorResponse('Cannot change your own role', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404));
    }

    res.status(200).json({ success: true, data: user });
  }
);
