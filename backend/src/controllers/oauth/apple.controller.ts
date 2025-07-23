// src/controllers/oauth/apple.controller.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserDocument } from '../../models/user/user.types';
import { container } from 'tsyringe';
import { AuthService } from '@/services/auth.service';

/**
 * Initiate Apple login
 */
export const appleLogin = passport.authenticate('apple', {
  scope: ['email', 'name'], // Apple allows name and email
});
const authService = container.resolve(AuthService) as unknown as AuthService;
/**
 * Handle Apple OAuth callback
 */
export const appleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'apple',
    {
      session: false,
      failureRedirect: '/api/v1/auth/login?error=oauth_failed',
    },
    async (err: Error, user: UserDocument) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/api/v1/auth/login?error=oauth_failed');
      }

      try {
        const token = await authService.generateJwtForUser(user as any);
        return res.status(200).json({ success: true, user, token });
      } catch (e) {
        return next(e);
      }
    }
  )(req, res, next);
};
