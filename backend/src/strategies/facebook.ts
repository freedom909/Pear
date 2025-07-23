import 'reflect-metadata'; // ← これをファイルの一番上に追加

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

    if (!config.clientID || !config.clientSecret) {
      logger.error('Missing Facebook OAuth configuration: clientID or clientSecret');
      throw new Error('Missing required Facebook OAuth configuration');
    }

    passport.use(
      new FacebookStrategy(
        {
          clientID: config.clientID,
          clientSecret: config.clientSecret,
          callbackURL: config.callbackURL,
          profileFields: ['id', 'emails', 'name', 'photos'],
          passReqToCallback: true,
          scope: config.scope || ['email'],
        },
        async (
          _req: Request,
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          logger.info('Processing Facebook OAuth callback', {
            profileId: profile.id
          });

          try {
            if (!profile.id) {
              throw new Error('Facebook profile missing required field: id');
            }

            const email = profile.emails?.[0]?.value;
// Ensure we have valid firstname and lastname
const firstname =
  profile.name?.givenName ||
  (profile.displayName?.split(' ')[0] || 'Facebook');

const lastname =
  profile.name?.familyName ||
  (profile.displayName?.split(' ')[1] || 'User');

const username = `${firstname}.${lastname}`.toLowerCase();


            // 1️⃣ Try to find existing user linked by provider
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'facebook'
            );

            if (user) {
              logger.info('Found existing user with Facebook provider', {
                userId: user._id
              });
              return done(null, user);
            }

            // 2️⃣ If no linked user, check by email
            if (email) {
              const existingUserByEmail = await userService.findUserByEmail(email);
              if (existingUserByEmail) {
                logger.info('Linking Facebook account to existing user', {
                  userId: existingUserByEmail._id,
                  email
                });

                await userService.linkOAuthProviderToUser(
                  existingUserByEmail,
                  'facebook',
                  profile.id,
                  profile,
                  true // Assuming Facebook email verified
                );

                return done(null, existingUserByEmail);
              }
            }

            // 3️⃣ If no user found, create new user
            logger.info('Creating new user from Facebook profile', {
              profileId: profile.id,
              email
            });

            user = await userService.createUserFromOAuthProfile({
              id: profile.id,
              name: {
                firstname,
                lastname
              },
              username,
              emails: profile.emails || [],
              avatar: profile.photos?.[0]?.value,
              isVerified: true, // Assuming Facebook emails are verified
              provider: 'facebook',
              oauth: {
                accessToken,
                refreshToken
              }
            });

            logger.info('Successfully created user from Facebook profile', {
              userId: user._id
            });

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
