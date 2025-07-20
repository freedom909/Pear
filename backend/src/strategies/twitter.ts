import { Strategy as TwitterStrategy } from 'passport-twitter';
import { PassportStatic } from 'passport';
import { BaseStrategy } from './base';
import { OAuthConfig} from '../models/interface';


import { logger } from '../utils/logger';


/**
 * ** Twitter OAuth Strategy
 */
export class TwitterOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: OAuthConfig, userService: any): void {
    if (logger && logger.debug) {
      logger.debug('Initializing Twitter OAuth strategy');
    }

    passport.use(
      new TwitterStrategy(
        {
          consumerKey: config.clientID,
          consumerSecret: config.clientSecret,
          callbackURL: config.callbackURL,
          // scope: config.scope || ['profile', 'email'],
          // passReqToCallback: config.passReqToCallback || true,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          logger.debug('Twitter OAuth callback received', {
            profileId: profile.id,
          });

          try {
            // 1. Find user by Twitter profile ID
            let user = await userService.findUserByOAuthProfile(
              { id: profile.id },
              'twitter'
            );

            // 2. If not found, check by email
            if (!user) {
              const email = profile.emails?.[0]?.value;

              if (email) {
                const existingUserByEmail =
                  await userService.findUserByEmail({email});
                if (existingUserByEmail) {
                  logger.info(
                    'Existing user found by email, linking Twitter account',
                    { email }
                  );

                  // 3. Link the Twitter profile ID to the existing user
                  await userService.linkOAuthProviderToUser(
                    existingUserByEmail,
                    {
                      provider: 'twitter',
                      id: profile.id,
                      profile,
                    }
                  );

                  return done(null, existingUserByEmail);
                }
              }

              // 4. No user by ID or email, create a new one
              logger.debug('Creating new user from Twitter profile', {
                profileId: profile.id,
              });
              
              // Extract name from Twitter profile
              const nameParts = profile.displayName ? profile.displayName.split(' ') : [];
              const firstname = nameParts[0] || 'Twitter';
              const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'User';
              
              logger.debug('Name fields from Twitter profile:', {
                firstname,
                lastname,
                displayName: profile.displayName
              });
              
              user = await userService.createUserFromOAuthProfile({
                id: profile.id,
                name: {
                  firstname: firstname,
                  lastname: lastname
                },
                username: profile.username || profile.displayName,
                emails: profile.emails || [],
                avatar: profile.photos?.[0]?.value,
                provider: 'twitter',
                oauth: {
                  accessToken: _accessToken,
                  refreshToken: _refreshToken
                }
              });
            } else {
              logger.debug('Found existing user with Twitter profile', {
                userId: user.id,
                profileId: profile.id,
              });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Error in Twitter OAuth strategy', { error });
            return done(error as Error, undefined);
          }
        }
      )
    );

    logger.debug('Twitter OAuth strategy initialized');
  }
}