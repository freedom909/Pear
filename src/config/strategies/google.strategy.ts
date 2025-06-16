import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserService } from '../../services/user.service';
import { BaseOAuthStrategy, OAuthConfig } from './base.strategy';
import { LoggerConfig } from '../logger.config';

export class GoogleOAuthStrategy extends BaseOAuthStrategy {
  constructor(
    private readonly passport: PassportStatic,
    config: OAuthConfig,
    userService: UserService
  ) {
    super(config, userService);
    this.configureStrategy();
  }

  protected configureStrategy(): void {
    try {
      this.passport.use(
        new GoogleStrategy(
          {
            clientID: this.config.clientID,
            clientSecret: this.config.clientSecret,
            callbackURL: this.config.callbackURL,
            scope: this.config.scope || ['profile', 'email'],
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await this.validateOAuthProfile(
                accessToken,
                refreshToken,
                {
                  id: profile.id,
                  provider: 'google',
                  emails: profile.emails,
                  photos: profile.photos,
                  name: {
                    givenName: profile.name?.givenName,
                    familyName: profile.name?.familyName,
                  },
                }
              );
              return done(null, user);
            } catch (error) {
              LoggerConfig.error('Error validating Google profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      LoggerConfig.info('Google OAuth strategy configured');
    } catch (error) {
      LoggerConfig.error('Error configuring Google OAuth strategy', { error });
      throw error;
    }
  }
}