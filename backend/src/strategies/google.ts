import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { BaseStrategy } from './base';
import logger from '../middleware/logger';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';
import { OAuthConfig } from '../models/interface';
import { handleOAuthCallback } from './handleOAuthCallback';

export class GoogleOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: OAuthConfig, userService: any): void {
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
          logger.info('Processing Google OAuth callback', {
            profileId: profile.id
          });

          try {
            const user = await handleOAuthCallback(
              profile,
              'google',
              userService,
              accessToken,
              refreshToken
            );

            logger.info("Google authentication successful");
            return done(null, user);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error('Google OAuth authentication failed', {
              error: err.message,
              stack: err.stack,
              profileId: profile.id,
              hasEmail: !!profile.emails?.[0]?.value
            });
            return done(err, undefined);
          }
        }
      )
    );

    logger.info('Google OAuth strategy initialized');
  }
}
