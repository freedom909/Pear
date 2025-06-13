import { Router } from 'express';
import { authController } from '../controllers';
import { validate } from '../middlewares';
import { authValidation } from '../validations';
import { authenticate } from '../middlewares';

// Create router
const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  validate(authValidation.register),
  authController.register.bind(authController)
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validate(authValidation.login),
  authController.login.bind(authController)
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshToken.bind(authController)
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Public
 */
router.post(
  '/logout',
  validate(authValidation.logout),
  authController.logout.bind(authController)
);

/**
 * @route POST /api/auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
);

/**
 * @route GET /api/auth/google
 * @desc Initiate Google authentication
 * @access Public
 */
router.get(
  '/google',
  authController.initiateGoogleAuth.bind(authController)
);

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google authentication callback
 * @access Public
 */
router.get(
  '/google/callback',
  authController.handleGoogleCallback.bind(authController)
);

export { router as authRoutes };