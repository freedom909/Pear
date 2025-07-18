// src/strategies/apple.ts
import { BaseStrategy } from './base';
import { PassportStatic } from 'passport';
import {
  Strategy as AppleStrategy,
  VerifyFunctionWithRequest, 
} from 'passport-apple';
import { OAuthConfig } from '../models/interface/index';
import { UserService } from '../services/user.service';
import logger from '../middleware/logger';


export class AppleOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: OAuthConfig, userService: UserService): void {
    logger.info('Initializing Apple OAuth strategy');

    const verify: VerifyFunctionWithRequest = async (
      _req,
      _accessToken,
      _refreshToken,
      idToken,
      profile,
      done
    ) => {
      try {
        logger.debug(`Apple OAuth callback for profile: ${profile.id}`);

        let user = await userService.findOne({ 'oauth.apple.id': profile.id });

        if (!user && profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          logger.debug(`User not found by Apple ID, trying email: ${email}`);
          const existingUser = await userService.findUserByEmail(email);

          if (existingUser) {
            logger.debug(`User found by email, linking Apple account: ${profile.id}`);
            const emailVerified = profile.email_verified || false;
            await userService.linkOAuthProviderToUser(existingUser, 'apple', profile.id, profile as any, emailVerified);
            await existingUser.save();
            user = existingUser;
          }
        }

        if (!user) {
          logger.debug(`Creating new user from Apple profile: ${profile.id}`);
 
                        const emailVerified = profile.email_verified || false;
                        // Ensure we have valid firstname and lastname
                        const firstname = profile.name?.firstname || 'Apple';
                        const lastname = profile.name?.lastname || 'User';
                        
                        logger.debug('Name fields from Apple profile:', {
                          firstname,
                          lastname,
                          displayName: profile.displayName
                        });
                        
                        user = await userService.createUserFromOAuthProfile(
                      {
                        id: profile.id,
                        name: {
                          firstname: firstname,
                          lastname: lastname
                        },
                        emails: profile.emails ?? [],
                        username: profile.username || '',
                        avatar: profile.photos?.[0]?.value || '',
                        provider: 'apple',
                        isVerified: emailVerified,
                        oauth: {
                          apple: {
                            id: profile.id,
                            token: idToken
                          }
                        }
                      },
          
          );
        }

        logger.debug(`Apple OAuth authentication successful for user: ${user._id}`);
        done(null, user);
      } catch (error) {
        logger.error(`Apple OAuth authentication error: ${(error as Error).message}`, { error });
        done(error as Error);
      }
    };

    passport.use(
      new AppleStrategy(
        {
          clientID: config.clientID ?? '',
          teamID: config.teamID ?? '',
          keyID: config.keyID ?? '',
          privateKeyLocation: config.privateKeyLocation ?? '',
          callbackURL: config.callbackURL ?? '',
          scope: ['email', 'name'],
          passReqToCallback: true,
        },
        verify
      )
    );
  }
}