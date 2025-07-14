import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { BaseStrategy } from './base';
import logger from '../middleware/logger';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';
import { OAuthConfig } from '../models/interface';

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
          passReqToCallback: config.passReqToCallback || true,

        },
        async (
          _req: Request,
          _accessToken: string,
          _refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          logger.info('Processing Google OAuth callback', {
            profileId: profile.id,
          });

          try {
            // Validate required profile fields
            if (!profile.id) {
              throw new Error('Google profile missing required field: id');
            }

            // Find existing user or create a new one
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'google'
            );

            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (email) {
                const existingUserByEmail =
                  await userService.findUserByEmail(email);
                if (existingUserByEmail) {
                  logger.info('Linking Google account to existing user', {
                    userId: existingUserByEmail._id,
                    email,
                    provider: 'google'
                  });
                  const user = existingUserByEmail;

                  // Only set username if you want to override
                  if (!user.username || user.username.startsWith('user_')) {
                    user.username =
                      profile.displayName ||
                      `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
                  }
                  await userService.linkOAuthProviderToUser(
                    user,
                    'google',
                    profile.id,
                    profile,
                    true // Assuming Google emails are verified
                  );
                  return done(null, existingUserByEmail);
                }
              }

              logger.info('Creating new user from Google profile', {
                profileId: profile.id,
                hasEmail: !!email,
                name: profile.name
              });
              logger.debug('Creating user payload from Google:', {
                id: profile.id,
                provider: 'google',
              });
              const firstname = profile.name?.givenName || '';
              const lastname = profile.name?.familyName || '';
              const username = `${firstname}.${lastname}`.toLowerCase();
              user = await userService.createUserFromOAuthProfile({
                id: profile.id,
                
                  lastname: profile.name?.familyName || 'google222',
                  firstname: profile.name?.givenName || 'google111',
              
                username,
                emails: profile.emails || [],
                avatar: profile.photos?.[0]?.value|| 'assets/images/default-avatar.png',
                isVerified: true, // Assuming Google emails are verified
                provider: 'google',
                oauth: {
                  accessToken: _accessToken,
                  refreshToken: _refreshToken
                }
              }
              );
              logger.info('Created new user from Google profile', {
                userId: user._id,
                profileId: profile.id
              });

              logger.info('Successfully created user from Google profile', {
                userId: user._id,
                profileId: profile.id
              });

            } else {
              logger.info('Found existing user with Google profile', {
                userId: user._id,
                profileId: profile.id,
              });
            }

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