//src/strategies/local.ts
import 'reflect-metadata'; // ← これをファイルの一番上に追加

import { Strategy as LocalStrategy } from 'passport-local';
import { PassportStatic } from 'passport';
import { BaseStrategy } from './base';
import logger from '../middleware/logger';
import { AppError } from '../errors/appError';
import ErrorCode from '../errors/error-code';
import { Request, Response, NextFunction } from 'express';
import UserService from '@/services/user.service';
import { container } from 'tsyringe';

export class LocalAuthStrategy extends BaseStrategy {
  private userServiceInstance: UserService;
  protected passport!: PassportStatic; 

    constructor() {
    super();
    this.userServiceInstance = container.resolve(UserService); // ← 正しく依存解決
  }
  
  /**
   * Validates user credentials using local authentication strategy.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param done - Passport.js callback function
   * @returns Promise resolving to void, calls done with either error or authenticated user
   * @throws AppError with appropriate error code for various failure cases:
   *   - NOT_FOUND when user doesn't exist
   *   - UNAUTHORIZED when password doesn't match
   *   - INTERNAL_SERVER_ERROR for other failures
   */
  async validate(email: string, password: string, done: Function): Promise<void> {
    try {
      // Find user by email
      const user = await this.userServiceInstance.findUserByEmail(email);
      if (!user) {
        return done(new AppError({
          message: '用户不存在',
          code: ErrorCode.NOT_FOUND,
          details: '用户不存在'
        }), false);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(new AppError({
          message: '密码错误',
          code: ErrorCode.UNAUTHORIZED,
          details: '密码错误'
        }), false);
        }
      return done(null, user);
    } catch (error) {
      logger.error('Local authentication error:', error);
      return done(new AppError({
        message:'登录失败',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error
      }), false); 
    }
  }

  // Add authenticate method for testing
  authenticate(req: Request, res: Response, next: NextFunction): void {
    this.passport.authenticate('local', {
      session: false,
    }, (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new AppError({
          message: info.message || '认证失败',
          code: ErrorCode.UNAUTHORIZED,
          details: info.details
        }));
      }
      req.user = user;
      next();
    })(req, res, next);
  }

  init(passport: PassportStatic, _config: any): void {
    // Store the userService instance for use in validate method
    
    this.passport = passport;
    
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        (email: string, password: string, done) => this.validate(email, password, done)
      )
    );

    passport.serializeUser(
      (user, done) => {
        done(null, (user as any)._id);
      }
    );

    passport.deserializeUser(
      async (id: string, done) => {
        try {
          const user = await this.userServiceInstance.findById(id);
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    );
  }
}