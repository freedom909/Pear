import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { UserService } from '../services/user';
import { Log } from '../logger/logger';
import { BaseOAuthStrategy } from './base';
import { OAuthConfig } from '../models/interface/index';

export class GoogleOAuthStrategy extends BaseOAuthStrategy {
    protected passport: PassportStatic;
    constructor(
        passport: PassportStatic, config: OAuthConfig, userService: UserService
      ) {
        super(config, userService);
        this.passport = passport;
        this.userService = userService;
        this.config = config;
      }
    protected config: OAuthConfig;
    protected userService: UserService;

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
          async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: (error: any, user?: Express.User | false) => void
          ) => {
            try {
              const user= await this.validateOAuthProfile(

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
              ) ;
              // Ensure the correct type is passed to done
              if (user) {
                return done(null, user as any ) ;
              } else {
                return done(null, false);
              }
            } catch (error) {
              Log.error('Error validating Google profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      Log.info('Google OAuth strategy configured');
    } catch (error) {
     Log.error('Error configuring Google OAuth strategy', { error });
      throw error;
    }
  }
}