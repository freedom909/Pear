import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import passport from 'passport';

const router = Router();

/**
 * Authentication Routes
 */

// Registration
router.post(
  '/register',
  ValidationMiddleware.validateRegistration,
  AuthController.register
);

// Login
router.post(
  '/login',
  ValidationMiddleware.validateLogin,
  AuthController.login
);

// Refresh Token
router.post(
  '/refresh-token',
  ValidationMiddleware.validateRefreshToken,
  AuthController.refreshToken
);

// Logout (requires authentication)
router.post(
  '/logout',
  AuthMiddleware.authenticate,
  AuthController.logout
);

// Get current user profile (requires authentication)
router.get(
  '/me',
  AuthMiddleware.authenticate,
  AuthController.getCurrentUser
);

// Password reset request
router.post(
  '/forgot-password',
  ValidationMiddleware.validateEmail,
  AuthController.forgotPassword
);

// Password reset
router.post(
  '/reset-password/:token',
  ValidationMiddleware.validatePasswordReset,
  AuthController.resetPassword
);

// Email verification
router.get(
  '/verify-email/:token',
  AuthController.verifyEmail
);

// Resend verification email
router.post(
  '/resend-verification',
  AuthMiddleware.authenticate,
  AuthController.resendVerificationEmail
);

// Social authentication routes
// Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  AuthController.socialLoginCallback('google')
);

// Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/facebook/callback',
  AuthController.socialLoginCallback('facebook')
);

// Twitter
router.get(
  '/twitter',
  passport.authenticate('twitter')
);

router.get(
  '/twitter/callback',
  AuthController.socialLoginCallback('twitter')
);

// Change password (requires authentication)
router.post(
  '/change-password',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validatePasswordChange,
  AuthController.changePassword
);

// Update profile (requires authentication)
router.put(
  '/profile',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateProfileUpdate,
  AuthController.updateProfile
);

export const authRouter = router;