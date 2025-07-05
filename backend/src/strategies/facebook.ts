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
          logger.info('Processing Facebook OAuth callback', {
            profileId: profile.id,
          });

          try {
            // Validate required profile fields
            if (!profile.id) {
              throw new Error('Facebook profile missing required field: id');
            }

            // Find existing user or create a new one
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'facebook'
            );

            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (email) {
                const existingUserByEmail =
                  await userService.findUserByEmail(email);
                if (existingUserByEmail) {
                  logger.info('Linking Facebook account to existing user', {
                    userId: existingUserByEmail._id,
                    email,
                    provider: 'facebook'
                  });
                  await userService.linkOAuthProviderToUser(
                    existingUserByEmail,
                    {
                      provider: 'facebook',
                      id: profile.id,
                      profile,
                    }
                  );
                  return done(null, existingUserByEmail);
                }
              }

              logger.info('Creating new user from Facebook profile', {
                profileId: profile.id,
                hasEmail: !!email,
                name: profile.name
              });

              user = await userService.createUserFromOAuthProfile(
                {
                  ...profile,
                  provider: 'facebook',
                  oauth: {
                    id: profile.id,
                    accessToken: _accessToken,
                    refreshToken: _refreshToken
                  }
                },
                'facebook'
              );

              logger.info('Successfully created user from Facebook profile', {
                userId: user._id,
                profileId: profile.id
              });
            } else {
              logger.info('Found existing user with Facebook profile', {
                userId: user._id,
                profileId: profile.id,
              });
            }

            return done(null, user);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error('Facebook OAuth authentication failed', {
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

    logger.info('Facebook OAuth strategy initialized');
  }
}