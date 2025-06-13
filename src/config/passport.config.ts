import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import googleConfig from './google.config';
import { LoggerConfig } from './logger.config';

/**
 * Configure Passport strategies
 */
export class PassportConfig {
  /**
   * Initialize Passport configuration
   */
  static init(): void {
    this.configureGoogleStrategy();
    
    LoggerConfig.info('Passport strategies configured');
  }
  
  /**
   * Configure Google OAuth strategy
   */
  private static configureGoogleStrategy(): void {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleConfig.clientId,
          clientSecret: googleConfig.clientSecret,
          callbackURL: googleConfig.callbackURL,
          passReqToCallback: true
        },
        (req, accessToken, refreshToken, profile, done) => {
          try {
            // Extract profile information
            const googleProfile = {
              id: profile.id,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
              lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
              avatar: profile.photos?.[0]?.value
            };
            
            // Validate required fields
            if (!googleProfile.email) {
              return done(new Error('Email not provided by Google'));
            }
            
            // Return profile
            return done(null, googleProfile);
          } catch (error) {
            LoggerConfig.error('Google strategy error', { error });
            return done(error);
          }
        }
      )
    );
  }
}