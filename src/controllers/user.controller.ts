import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/interface/index';
import User from '../models/user/user.model';
import { ErrorResponse } from '../utils/errorResponse';
import  logger  from '../utils/logger';

/**
 * @desc    获取所有用户
 * @route   GET /api/v1/users
 * @access  私有/管理员
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 使用高级查询功能（在实际应用中可以实现）
    // const advancedResults = res.advancedResults;
    // res.status(200).json(advancedResults);

    // 简单实现
    const users = await User.find();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    logger.error('获取所有用户失败:', error);
    next(error);
  }
};

/**
 * @desc    获取单个用户
 * @route   GET /api/v1/users/:id
 * @access  私有/管理员
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`ID为${req.params.id}的用户不存在`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`获取ID为${req.params.id}的用户失败:`, error);
    next(error);
  }
};

/**
 * @desc    创建用户
 * @route   POST /api/v1/users
 * @access  私有/管理员
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('创建用户失败:', error);
    next(error);
  }
};

/**
 * @desc    更新用户
 * @route   PUT /api/v1/users/:id
 * @access  私有/管理员
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(`ID为${req.params.id}的用户不存在`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`更新ID为${req.params.id}的用户失败:`, error);
    next(error);
  }
};

/**
 * @desc    删除用户
 * @route   DELETE /api/v1/users/:id
 * @access  私有/管理员
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`ID为${req.params.id}的用户不存在`, 404)
      );
    }

    // 防止删除自己
    if ((req as any).user.id === req.params.id) {
      return next(new ErrorResponse('不能删除自己的账户', 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error(`删除ID为${req.params.id}的用户失败:`, error);
    next(error);
  }
};

/**
 * @desc    更改用户角色
 * @route   PUT /api/v1/users/:id/role
 * @access  私有/管理员
 */
export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return next(new ErrorResponse('无效的角色', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`ID为${req.params.id}的用户不存在`, 404)
      );
    }

    // 防止更改自己的角色
    if ((req as any).user.id === req.params.id) {
      return next(new ErrorResponse('不能更改自己的角色', 400));
    }

    user.role = role as UserRole;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`更改ID为${req.params.id}的用户角色失败:`, error);
    next(error);
  }
};