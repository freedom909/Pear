import { Router } from 'express';
import passport from 'passport';
import { LoggerConfig } from '../config/logger.config.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

/**
 * Google OAuth routes
 */
// Import Google authentication handlers
import { initiateGoogleAuthentication, handleGoogleCallback, unlinkGoogle } from '../config/google.passport.js';

/**
 * Google OAuth routes
 */
router.get('/google', initiateGoogleAuthentication);

router.get('/google/callback', handleGoogleCallback);

// Route to unlink Google account
router.get('/google/unlink', unlinkGoogle);

/**
 * Facebook OAuth routes
 */
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    LoggerConfig.info('Facebook authentication successful');
    res.redirect('/');
  }
);

/**
 * Twitter OAuth routes
 */
router.get(
  '/twitter',
  passport.authenticate('twitter')
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    LoggerConfig.info('Twitter authentication successful');
    res.redirect('/');
  }
);

/**
 * Apple OAuth routes
 */
router.get(
  '/apple',
  AuthController.initiateAppleAuth
);

router.get(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/login' }),
  AuthController.handleAppleCallback
);

/**
 * Logout route
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      LoggerConfig.error('Error during logout', { error: err });
      return res.status(500).json({ error: 'Error during logout' });
    }
    LoggerConfig.info('User logged out successfully');
    res.redirect('/login');
  });
});

/**
 * Get current user route
 */
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

/**
 * Email verification routes
 */
router.post('/send-verification-email', AuthController.sendVerificationEmail);
router.get('/verify-email', AuthController.verifyEmail);

export const authRoutes = router;