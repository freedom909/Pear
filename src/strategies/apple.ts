import { PassportStatic } from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import { UserService } from '../services/user';
import { BaseOAuthStrategy } from './base';
import { Log } from '../logger/logger';
import {OAuthConfig} from '../models/interface/index';

export class AppleOAuthStrategy extends BaseOAuthStrategy {
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
        new AppleStrategy( 
          {
            clientID: this.config.clientID!,
            teamID: this.config.teamID!,
            keyID: this.config.keyID!,
            privateKeyLocation: this.config.privateKeyLocation!,
            callbackURL: this.config.callbackURL,
            scope: this.config.scope || ['name', 'email'],
            passReqToCallback: false
          },
          async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
              // Apple profile structure is different from other providers
              // It might not have all the fields we expect
              const user = await this.validateOAuthProfile(
                accessToken as unknown as string,            
                refreshToken as unknown as string,
                {
                  id: profile.id,
                  provider: 'apple',
                  emails: profile.emails || [],
                  photos: profile.photos || [],
                  name: {
                    givenName: profile.name?.firstName || '',
                    familyName: profile.name?.lastName || '',
                  },
                }
              );
              return done(null, user);
            } catch (error) {
              Log.error('Error validating Apple profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      Log.info('Apple OAuth strategy configured');
    } catch (error) {
      Log.error('Error configuring Apple OAuth strategy', { error });
      throw error;
    }
  }
}