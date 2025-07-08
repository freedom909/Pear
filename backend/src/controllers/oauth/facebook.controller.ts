// src/controllers/oauth/Facebook.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import authService from '../../services/auth.service'; // your JWT‐issuing service
import { UserDocument } from '../../models/interface/index'; // for typing

/**
 * Step 1: Redirect to Facebook for consent.
 * Route: GET /api/v1/auth/Facebook
 */
export const facebookLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('facebook', { scope: ['email'], session: false })(
    req,
    res,
    next
  );
};

/**
 * Step 2: Handle Facebook callback.
 * Route: GET /api/v1/auth/Facebook/callback
 */
export const facebookCallback = [
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/api/v1/auth/login?error=oauth_failed',
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as UserDocument;
      if (!user) {
        return res.redirect('/api/v1/auth/login?error=oauth_failed');
      }
      const token = await authService.generateJwtForUser(user);
      console.log('Generated JWT token:', token);
      return res.redirect(
        `http://localhost:3000/social-success?token=${token}`
      );
    } catch (error) {
      return next(error);
    }
  },
];

