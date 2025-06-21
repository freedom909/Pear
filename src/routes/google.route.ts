import { Router } from 'express';
import passport from 'passport';
import { GoogleAuthController } from '../controllers/oauth/google.controller';

const router = Router();

// Initiate Google authentication
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Handle Google authentication callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  GoogleAuthController.handleCallback
);

export default router;