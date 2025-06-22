/**
 * Google OAuth Controller
 * 
 * Handles Google OAuth authentication flow with two main endpoints:
 * 1. googleLogin - Initiates the OAuth flow by redirecting to Google's consent screen
 * 2. googleCallback - Handles the callback from Google after authentication
 * 
 * @module GoogleOAuthController
 */

/**
 * Initiates Google OAuth flow by redirecting to Google's consent screen.
 * Uses passport.js Google strategy with 'profile' and 'email' scopes.
 * 
 * @function googleLogin
 * @route GET /api/v1/auth/google
 */

/**
 * Handles Google OAuth callback after authentication.
 * On success: Generates JWT token and returns user data with token.
 * On failure: Redirects to login page with error or passes error to error handler.
 * 
 * @function googleCallback
 * @route GET /api/v1/auth/google/callback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
// src/controllers/oauth/google.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../../services/auth.service';    // your JWT‐issuing service
import { UserDocument } from '../../models/interface/index';  // for typing

/**
 * Step 1: Redirect to Google for consent.
 * Route: GET /api/v1/auth/google
 */
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Step 2: Handle Google callback.
 * Route: GET /api/v1/auth/google/callback
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'google',
    { session: false, failureRedirect: '/api/v1/auth/login?error=oauth_failed' },
    async (err, user: UserDocument, _info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // OAuth failed, redirect or JSON error
        return res.redirect('/api/v1/auth/login?error=oauth_failed');
      }
      try {
        // Here you generate a JWT or start a session
        const token = await authService.generateJwtForUser(user);
        // Return user + token (or set as cookie, etc.)
        return res.json({ success: true, user, token });
      } catch (e) {
        return next(e);
      }
    }
  )(req, res, next);
};
