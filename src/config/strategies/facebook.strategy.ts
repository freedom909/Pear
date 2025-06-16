import { PassportStatic } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { UserService } from '../../services/user.service';
import { BaseOAuthStrategy, OAuthConfig } from './base.strategy';
import { LoggerConfig } from '../logger.config';

export class FacebookOAuthStrategy extends BaseOAuthStrategy {
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
        new FacebookStrategy(
          {
            clientID: this.config.clientID,
            clientSecret: this.config.clientSecret,
            callbackURL: this.config.callbackURL,
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
            scope: this.config.scope || ['email'],
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              // Facebook profile structure is a bit different
              const user = await this.validateOAuthProfile(
                accessToken,
                refreshToken,
                {
                  id: profile.id,
                  provider: 'facebook',
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
              LoggerConfig.error('Error validating Facebook profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      LoggerConfig.info('Facebook OAuth strategy configured');
    } catch (error) {
      LoggerConfig.error('Error configuring Facebook OAuth strategy', { error });
      throw error;
    }
  }
}