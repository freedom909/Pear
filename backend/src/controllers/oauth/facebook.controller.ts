// src/controllers/oauth/Facebook.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import {AuthService} from '../../services/auth.service'; // your JWT‐issuing service
import { UserDocument } from '../../models/user/user.types'; // for typing
import { container } from 'tsyringe';

const authService =container.resolve(AuthService);
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
      const user = req.user as unknown as UserDocument;
      if (!user) {
         return res.redirect("http://localhost:3000/login?error=facebook_failed");
      }
      const token = await authService.generateJwtForUser(user);
      console.log('Generated JWT token:', token);
      const redirectUrl = `http://localhost:3000/dashboard?token=${token}`;
      res.cookie('auth_token', token, {
  httpOnly: true,
  secure: false,        // ⚠️ set to false for localhost
  sameSite: 'lax',      // ✅ works with HTTP and is secure enough for dev
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
      return res.redirect(redirectUrl);

    } catch (error) {
      console.error('Error in Facebook callback:', error);
      return next(error);
    }
  },
];
