import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
// your JWT‐issuing service
import { UserDocument } from '../../models/interface/index'; // for typing
import { asyncHandler } from '../../middleware/errorHandler';
/**
 * Step 1: Redirect to Facebook for consent.
 * Route: GET /api/v1/auth/Facebook
 */
/**
 * @desc    Initiate Google OAuth login
 * @route   GET /api/v1/auth/google
 * @access  Public
 */
export const googleLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res, next);
  }
);

/**
 * @desc    Google OAuth callback
 * @route   GET /api/v1/auth/google/callback
 * @access  Public
 */
export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'google',
    { session: false },
    async (err, user: UserDocument, _info) => {
      console.log('===> OAuth err:', err);
      console.log('===> OAuth user:', user);
      console.log('===> OAuth info:', _info);

      if (err || !user) {
        return res
          .status(401)
          .json({ success: false, message: 'Google OAuth failed' });
      }
      const token = user.getSignedJwtToken();
      // Transform user object to ensure avatar is included
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        linkedAccounts: user.linkedAccounts || [],
        avatar: user.avatar || '/images/avatar.jpg' // Ensure avatar is included
      };
      
      return res.status(200).json({
        success: true,
        token,
        user: userResponse,
      });
    }
  )(req, res, next);
};