import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';

export class LogoutController {
  /**
   * Handle user logout
   * @route POST /auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear token cookies
      res.clearCookie('token');
      res.clearCookie('refreshToken');

      // Handle session logout if exists
      if (req.logout) {
        req.logout((err) => {
          if (err) {
            throw new AppError({
              message: 'Logout failed',
              code: ErrorCode.INTERNAL_SERVER_ERROR,
              details: err
            });
          }
        });
      }

      // Destroy session if exists
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            throw new AppError({
              message: 'Session destruction failed',
              code: ErrorCode.INTERNAL_SERVER_ERROR,
              details: err
            });
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}