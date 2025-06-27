import { PassportStatic } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

import { BaseStrategy } from './base';
import logger from '../middleware/logger';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';
import { OAuthConfig } from '../models/interface';

export class FacebookOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: OAuthConfig, userService: any): void {
    logger.info('Initializing Facebook OAuth strategy');
    
    passport.use(
      new FacebookStrategy(
        {
          clientID: config.clientID,
          clientSecret: config.clientSecret,
          callbackURL: config.callbackURL,
          profileFields: ['id', 'emails', 'name', 'photos'],
          passReqToCallback: config.passReqToCallback || true,
          scope: config.scope || ['email'],
        },
        async (
          _req: Request,
          _accessToken: string,
          _refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          logger.info('Processing Facebook OAuth callback', { profileId: profile.id });

          try {
            // Find existing user or create a new one
            let user = await userService.findOne({ facebookId: profile.id });
            
            if (!user) {
              logger.info('Creating new user from Facebook profile', { profileId: profile.id });
              user = await userService.createUserFromOAuthProfile(profile as any, 'facebook');
            } else {
              logger.info('Found existing user with Facebook profile', { userId: user.id, profileId: profile.id });
            }
            
            return done(null, user);
          } catch (error) {
            logger.error('Error in Facebook OAuth strategy', { error });
            return done(error as Error, undefined);
          }
        }
      )
    );
    
    logger.info('Facebook OAuth strategy initialized');
  }
}