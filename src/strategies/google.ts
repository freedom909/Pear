// src/strategies/google.ts
import { BaseStrategy } from "./base";
import { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { OAuthConfig } from "../models/interface";
import logger from "../utils/logger";

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
          try {
            logger.info('Processing Google OAuth callback', { profileId: profile.id });
            
            // Find existing user or create a new one
            let user = await userService.findOne({ googleId: profile.id });
            
            if (!user) {
              logger.info('Creating new user from Google profile', { profileId: profile.id });
              user = await userService.createUserFromOAuthProfile(profile as any, 'google');
            } else {
              logger.info('Found existing user with Google profile', { userId: user.id, profileId: profile.id });
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