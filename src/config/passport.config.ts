import passport from 'passport';
import { UserService } from '../services/user.service';
import { OAuthStrategyFactory } from './strategies/oauth.factory';
import { OAuthConfiguration } from './oauth.config';
import { LoggerConfig } from './logger.config';

/**
 * Passport configuration
 */
export class PassportConfig {
  private static oauthFactory: OAuthStrategyFactory;

  /**
   * Initialize Passport configuration
   */
  static initialize(userService: UserService): void {
    try {
      // Create OAuth strategy factory
      this.oauthFactory = new OAuthStrategyFactory(passport, userService);
      
      // Initialize OAuth strategies
      const oauthConfigs = OAuthConfiguration.getConfigs();
      this.oauthFactory.initializeStrategies(oauthConfigs);
      
      LoggerConfig.info('Passport configuration initialized successfully');
    } catch (error) {
      LoggerConfig.error('Failed to initialize Passport configuration', { error });
      throw error;
    }
  }

  /**
   * Get Passport instance
   */
  static getPassport(): passport.PassportStatic {
    return passport;
  }
}