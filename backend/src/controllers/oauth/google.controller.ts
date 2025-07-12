// src/controllers/oauth/Google.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import authService from '../../services/auth.service'; // your JWT‐issuing service
import { UserDocument } from '../../models/user/user.types'; // for typing

/**
 * Step 1: Redirect to Google for consent.
 * Route: GET /api/v1/auth/Google
 */
export const googleLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', { scope: ['email'], session: false })(
    req,
    res,
    next
  );
};

/**
 * Step 2: Handle Google callback.
 * Route: GET /api/v1/auth/Google/callback
 */
export const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/login?error=oauth_failed',
   
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as UserDocument;
      if (!user) {
         return res.redirect("http://localhost:3000/login?error=google_failed");
      }
      const token = await authService.generateJwtForUser(user);
      console.log('Generated JWT token:', token);
      console.log('👉 Redirecting to: http://localhost:3000/oauth/google-callback?token=' + token);
console.log("🌟🌟🌟 About to redirect to:");
console.log(`http://localhost:3000/oauth/google-callback?token=${token}`);

      res.redirect(`http://localhost:3000/oauth/google-callback?token=${token}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      return next(error);
    }
  },
];
