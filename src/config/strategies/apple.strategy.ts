import { PassportStatic } from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import { UserService } from '../../services/user.service';
import { BaseOAuthStrategy, OAuthConfig } from './base.strategy';
import { LoggerConfig } from '../logger.config';

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
            clientID: this.config.clientID,
            teamID: this.config.teamId,
            keyID: this.config.keyId,
            privateKeyLocation: this.config.privateKeyLocation,
            callbackURL: this.config.callbackURL,
            scope: this.config.scope || ['name', 'email'],
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              // Apple profile structure is different from other providers
              // It might not have all the fields we expect
              const user = await this.validateOAuthProfile(
                accessToken,
                refreshToken,
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
              LoggerConfig.error('Error validating Apple profile', { error });
              return done(error as Error);
            }
          }
        )
      );
      LoggerConfig.info('Apple OAuth strategy configured');
    } catch (error) {
      LoggerConfig.error('Error configuring Apple OAuth strategy', { error });
      throw error;
    }
  }
}