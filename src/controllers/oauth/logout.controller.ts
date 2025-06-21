import { Request, Response, NextFunction } from 'express';

export class LogoutController {
  /**
   * Handle user logout
   * @route GET /auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    } catch (error) {
      next(error);
    }
  }
}