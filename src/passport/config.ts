import passport from 'passport';
import { UserService } from '../services/user.ts';
import { OAuthStrategyFactory } from '../strategies/auth.factory.ts';
import { OAuthConfiguration } from '../config/oauth.ts';
import { Log } from '../logger/logger.ts';

export class PassportConfig {
    private static oauthFactory: OAuthStrategyFactory;
    private static userService: UserService;
    private static logger: Log;
    static initialize(configs: Record<string, any>): void {
        const { passport: passportConfig, userService, logger } = configs;
        PassportConfig.oauthFactory = new OAuthStrategyFactory(passport, OAuthConfiguration.getConfigs(), userService);
        PassportConfig.userService = userService;
        PassportConfig.logger = logger;
        PassportConfig.oauthFactory.initializeStrategies(OAuthConfiguration.getConfigs());
        passportConfig.initialize();
        passportConfig.session();
        logger.info('Passport initialized');
      }

      getPassport(): passport.PassportStatic {
        return passport;
      }
}
