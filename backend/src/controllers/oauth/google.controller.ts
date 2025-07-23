// src/controllers/oauth/Google.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService} from '../../services/auth.service'; // your JWT‐issuing service
import { UserDocument } from '../../models/user/user.types'; // for typing
import { container } from 'tsyringe';

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


const authService = container.resolve(AuthService) as unknown as AuthService;
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
      console.log('✅ Generated JWT token:', token);

    console.log('✅ Setting cookie for user:', user.email);  // ✅ Set cookie
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: false,        // ⚠️ set to false for localhost
  sameSite: 'lax',      // ✅ works with HTTP and is secure enough for dev
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});



      // ✅ Redirect to frontend dashboard
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      return next(error);
    }
  },
];

