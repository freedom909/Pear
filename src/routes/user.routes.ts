import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import { validate } from '../middlewares';
import { userValidation } from '../validations';
import { UserRole } from '../models';

// Create router
const router = Router();

/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getProfile.bind(userController)
);

/**
 * @route PUT /api/users/profile
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  validate(userValidation.updateProfile),
  userController.updateProfile.bind(userController)
);

/**
 * @route PUT /api/users/change-password
 * @desc Change password
 * @access Private
 */
router.put(
  '/change-password',
  authenticate,
  validate(userValidation.changePassword),
  userController.changePassword.bind(userController)
);

/**
 * Admin routes
 */

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Admin
 */
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.getUserById),
  userController.getUserById.bind(userController)
);

/**
 * @route GET /api/users
 * @desc Get users list
 * @access Admin
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.getUsers),
  userController.getUsers.bind(userController)
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.updateUser),
  userController.updateUser.bind(userController)
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.deleteUser),
  userController.deleteUser.bind(userController)
);

export { router as userRoutes };