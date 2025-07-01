// src/controllers/oauth/google.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../../services/auth.service';   
import { UserDocument } from '../../models/user/user.types';  

/**
 * Step 1: Redirect to Google for consent.
 * Route: GET /api/v1/auth/google
 */
export const twitterLogin = passport.authenticate('twitter', {
  scope: ['profile', 'email'],
});

/**
 * Step 2: Handle Google callback.
 * Route: GET /api/v1/auth/google/callback
 */
export const twitterCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('twitter', {
    session: false, failureRedirect: process.env.FAILURE_REDIRECT_URL ,},
    async (err: Error, user: UserDocument, _info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // OAuth failed, redirect or JSON error
        return res.redirect('/api/v1/auth/login?error=oauth_failed');
      }
      try {
        // Here you generate a JWT or start a session
        const token = await authService.generateJwtForUser(user as any);
        // Return user + token (or set as cookie, etc.)
        return res.json({ success: true, user, token });
      } catch (e) {
        return next(e);
      }
    }
  )(req, res, next);
};
