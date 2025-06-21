import { PassportStatic } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { UserService } from '../services/user';
import { BaseOAuthStrategy,  } from './base';
import { Log } from '../logger/logger';
import { OAuthConfig } from 'models/user/index';

export class FacebookOAuthStrategy extends BaseOAuthStrategy { protected passport: PassportStatic;
  protected config: OAuthConfig;
  protected userService: UserService;
  constructor(
      passport: PassportStatic, config: OAuthConfig, userService: UserService
    ) {
      super(config, userService);
      this.passport = passport;// Property 'passport' does not exist on type 'GoogleOAuthStrategy'
      this.userService = userService;
      this.config = config;
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
              Log.error('Error validating Facebook profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      Log.info('Facebook OAuth strategy configured');
    } catch (error) {
      Log.error('Error configuring Facebook OAuth strategy', { error });
      throw error;
    }
  }
}