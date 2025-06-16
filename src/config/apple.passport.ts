import passport from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Request, Response, NextFunction } from 'express';
import { config } from './index';
import { LoggerConfig } from './logger.config';

// Apple OAuth configuration
const appleConfig = {
  clientID: process.env.APPLE_CLIENT_ID || '',
  teamID: process.env.APPLE_TEAM_ID || '',
  keyID: process.env.APPLE_KEY_ID || '',
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || '',
  callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/api/auth/apple/callback',
  passReqToCallback: true
};

// Configure Apple strategy
passport.use(
  new AppleStrategy(
    {
      clientID: appleConfig.clientID,
      teamID: appleConfig.teamID,
      keyID: appleConfig.keyID,
      privateKeyLocation: appleConfig.privateKeyLocation,
      callbackURL: appleConfig.callbackURL,
      passReqToCallback: true
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Apple profile might not include email and name on subsequent logins
        // Store the initial profile data in session if available
        if (req.body?.user) {
          const user = JSON.parse(req.body.user);
          profile.email = user.email;
          profile.name = {
            firstName: user.name?.firstName,
            lastName: user.name?.lastName
          };
        }

        return done(null, {
          id: profile.id,
          email: profile.email,
          name: profile.name
        });
      } catch (error) {
        LoggerConfig.error('Apple authentication error', { error });
        return done(error);
      }
    }
  )
);

// Initialize Apple authentication
export const initiateAppleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('apple', {
    scope: ['email', 'name'],
    session: false
  })(req, res, next);
};

// Export Apple strategy configuration
export const appleAuthConfig = appleConfig;