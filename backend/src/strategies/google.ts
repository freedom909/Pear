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
            if (!profile.id) {
              throw new Error('Google profile missing required field: id');
            }

            // 0️⃣ Get user info from Google profile
            const firstname = profile.name?.givenName || 'Google';
            const lastname = profile.name?.familyName || 'User';
            const username = `${firstname}.${lastname}`.toLowerCase();

            // 1️⃣ Try to find existing user linked by provider
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'google'
            );

            if (user) {
              logger.info('Found existing user with Google provider', {
                userId: user._id
              });
              return done(null, user);
            }

            // 2️⃣ If no linked user, check by email
const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;

if (!user && email) {
  const existingUserByEmail = await userService.findUserByEmail(email);
  if (existingUserByEmail) {
    // Link Google to this user
    await userService.linkOAuthProviderToUser(
      existingUserByEmail,
      'google',
      profile.id,
      profile,
      true
    );
    return done(null, existingUserByEmail);
  }
}


            // 3️⃣ If no user found, create new user
            logger.info('Creating new user from Google profile', {
              profileId: profile.id,
              email
            });
if (!user) {
            user = await userService.createUserFromOAuthProfile({
              id: profile.id,
              name: {
                firstname,
                lastname
              },
              username,
              emails: profile.emails?.[0]?.value || [],
              avatar: profile.photos?.[0]?.value,
              isVerified: true, // Assuming verified
              provider: 'google',
              oauth: {
                accessToken,
                refreshToken
              }
            });
          }
            logger.info('Successfully created user from Google profile', {
              userId: user._id
            });

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
