// src/strategies/google.ts
import { BaseStrategy } from './base';
import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuthConfig, UserDocument } from '../models/interface';
import logger from '../middleware/logger';

export class GoogleOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: OAuthConfig, userService: any): void {
    logger.info('Initializing Google OAuth strategy');

    passport.use(
      new GoogleStrategy(
        {
          clientID: config.clientID,
          clientSecret: config.clientSecret,
          callbackURL: config.callbackURL,
          scope: config.scope || ['profile', 'email'],
          passReqToCallback: config.passReqToCallback || true,
        },
        async (_req, _accessToken, _refreshToken, profile, done) => {
          logger.info('Google OAuth callback received', {
            profileId: profile.id,
          });

          try {
            // 1. Find user by Google profile ID
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'google'
            );

            // 2. If not found, check by email
            if (!user) {
              const email = profile.emails?.[0]?.value;

              if (email) {
                const existingUserByEmail =
                  await userService.findUserByEmail(email);
                if (existingUserByEmail) {
                  logger.info(
                    'Existing user found by email, linking Google account',
                    { email }
                  );

                  // 3. Link the Google profile ID to the existing user
                  await userService.linkOAuthProviderToUser(
                    existingUserByEmail,
                    {
                      provider: 'google',
                      id: profile.id,
                      profile,
                    }
                  );

                  return done(null, existingUserByEmail);
                }
              }

              // 4. No user by ID or email, create a new one
              logger.info('Creating new user from Google profile', {
                profileId: profile.id,
              });
              user = await userService.createUserFromOAuthProfile(
                profile as unknown as UserDocument,
                'google'
              );
            } else {
              logger.info('Found existing user with Google profile', {
                userId: user.id,
                profileId: profile.id,
              });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Error in Google OAuth strategy', { error });
            return done(error as Error, undefined);
          }
        }
      )
    );

    logger.info('Google OAuth strategy initialized');
  }
}
