import 'reflect-metadata'; // ← これをファイルの一番上に追加

import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { BaseStrategy } from './base';
import logger from '../middleware/logger';
import { Request, Response, NextFunction } from 'express';
import { OAuthConfig } from '../models/interface';
import { AppError } from '../errors/appError';
import ErrorCode from '../errors/error-code';
import { AuthProvider } from '../models/user/user.types';
import { UserDocument } from '../models/user/user.types';

import { UserRepository } from '@/repositories/user.repository';
//import { container } from 'tsyringe';


//const userRepository=container.resolve(UserRepository);
export class GoogleOAuthStrategy extends BaseStrategy { 
  private userService: {
    findUserByEmail: (email: string) => Promise<UserDocument | null>;
    findUserByProviderId: (providerId: string, provider: AuthProvider) => Promise<UserDocument | null>;
    createUser: (user: Partial<UserDocument>) => Promise<UserDocument>;
  };
  private passport!: PassportStatic;
  private userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
    this.userService = {
      findUserByEmail: () => Promise.resolve(null),
      findUserByProviderId: async (providerId, provider) => {
            logger.info('Searching user by providerId', {providerId, provider});
            const user = await this.userRepository.findOne({ 
                $where: { providerId, provider } 
            });
            logger.info('User search result', {found: !!user, providerId});
            return user;
        },
      createUser: () => Promise.reject(new Error('UserService not initialized'))
    };
  }

  init(passport: PassportStatic, config: OAuthConfig, userService: any): void {
    if (!userService) {
      throw new Error('userService is required');
    }
    
    // Verify all required methods exist
    const requiredMethods = ['findUserByEmail', 'findUserByProviderId', 'createUser'];
    requiredMethods.forEach(method => {
      if (typeof userService[method] !== 'function') {
        throw new Error(`userService.${method} must be a function`);
      }
    });

    this.userService = userService;
    this.passport = passport;
    
    logger.info('Initializing Google OAuth strategy');

    if (!config.clientID || !config.clientSecret) {
      logger.error('Missing Google OAuth configuration: clientID or clientSecret');
      throw new Error('Missing required Google OAuth configuration');
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: config.clientID,
          clientSecret: config.clientSecret,
          callbackURL: config.callbackURL,
          scope: [...(config.scope || ['email']), 'profile'],
          passReqToCallback: true
        },
        async (
          _req: Request,
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          try {
            logger.info('Processing Google OAuth callback', { profileId: profile.id });
            await this.validate(accessToken, refreshToken, profile, done);
          } catch (error) {
             console.error("Google Strategy error:", error);
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error('Google OAuth authentication failed', {
              error: err.message,
              stack: err.stack,
              profileId: profile.id
            });
            return done(err, undefined);
          }
        }
      )
    );

    logger.info('Google OAuth strategy initialized');
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> {
    console.log('🔍 Google profile received:', JSON.stringify(profile, null, 2));

    try {
      // Test case: should handle profile without email
      if (!profile.emails?.[0]?.value) {
        const err = new AppError({
          message:'Google OAuth profile is missing email',
          code: ErrorCode.BAD_REQUEST,
          details: profile
        });
        return done(err, false);
      }

      // Use test email addresses that match test expectations
      const email = profile.emails[0].value;
      
      // Test case: should return existing user if found by email
      console.log('🔍 Checking user by email:', email);
const existingUser = await this.userService.findUserByEmail(email);
console.log('✅ Existing user by email:', existingUser);
      if (existingUser) {
        return done(null, existingUser as unknown as any);
      }

      // Test case: should return existing user if found by providerId
      const existingByProvider = await this.userService.findUserByProviderId(
        profile.id,// should it be provider.id?
        AuthProvider.GOOGLE
      );
      if (existingByProvider) {
        return done(null, existingByProvider as unknown as any);
      }

      // Test case: should create and return a new user if user does not exist
      const newUser = await this.userService.createUser({
        email,
        firstname: profile.name?.givenName || profile.displayName,
        lastname: profile.name?.familyName || '',
        provider: AuthProvider.GOOGLE,
        providerId: profile.id,
        avatar: profile.photos?.[0]?.value || '',
      });

      return done(null, newUser as unknown as any);
    } catch (error) {
      // Test case: should handle unexpected errors
      const err = new AppError({
        message: 'Google OAuth authentication failed',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error : new Error(String(error))
      });
      return done(err, false);
    }
  }
  
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email']
    }, (err, user, info) => {
      if (err || !user) {
        return next(err || new AppError(info.message));
      }
      req.user = user;
      next();
    })(req, res, next);
  } 
}

// Export with the name expected by tests
export { GoogleOAuthStrategy as GoogleStrategy };