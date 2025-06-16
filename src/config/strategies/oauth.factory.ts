import { PassportStatic } from 'passport';
import { UserService } from '../../services/user.service';
import { GoogleOAuthStrategy } from './google.strategy';
import { FacebookOAuthStrategy } from './facebook.strategy';
import { TwitterOAuthStrategy } from './twitter.strategy';
import { AppleOAuthStrategy } from './apple.strategy';
import { OAuthConfig } from './base.strategy';
import { LoggerConfig } from '../logger.config';

/**
 * OAuth strategy factory class
 */
export class OAuthStrategyFactory {
  private strategies: Map<string, any> = new Map();

  constructor(
    private readonly passport: PassportStatic,
    private readonly userService: UserService
  ) {}

  /**
   * Initialize OAuth strategies
   */
  public initializeStrategies(configs: Record<string, OAuthConfig>): void {
    try {
      LoggerConfig.info('Initializing OAuth strategies');

      // Initialize Google strategy if config exists
      if (configs.google) {
        this.strategies.set(
          'google',
          new GoogleOAuthStrategy(this.passport, configs.google, this.userService)
        );
        LoggerConfig.info('Google OAuth strategy initialized');
      }

      // Initialize Facebook strategy if config exists
      if (configs.facebook) {
        this.strategies.set(
          'facebook',
          new FacebookOAuthStrategy(this.passport, configs.facebook, this.userService)
        );
        LoggerConfig.info('Facebook OAuth strategy initialized');
      }

      // Initialize Twitter strategy if config exists
      if (configs.twitter) {
        this.strategies.set(
          'twitter',
          new TwitterOAuthStrategy(this.passport, configs.twitter, this.userService)
        );
        LoggerConfig.info('Twitter OAuth strategy initialized');
      }

      // Initialize Apple strategy if config exists
      if (configs.apple) {
        this.strategies.set(
          'apple',
          new AppleOAuthStrategy(this.passport, configs.apple, this.userService)
        );
        LoggerConfig.info('Apple OAuth strategy initialized');
      }

      // Configure Passport serialization
      this.configurePassportSerialization();
      LoggerConfig.info('OAuth strategies initialization completed');
    } catch (error) {
      LoggerConfig.error('Error initializing OAuth strategies', { error });
      throw error;
    }
  }

  /**
   * Configure Passport serialization
   */
  private configurePassportSerialization(): void {
    try {
      // Serialize user to session
      this.passport.serializeUser((user: any, done) => {
        LoggerConfig.debug('Serializing user', { userId: user.id });
        done(null, user.id);
      });

      // Deserialize user from session
      this.passport.deserializeUser(async (id: string, done) => {
        try {
          LoggerConfig.debug('Deserializing user', { userId: id });
          const user = await this.userService.findUserById(id);
          done(null, user);
        } catch (error) {
          LoggerConfig.error('Error deserializing user', { error, userId: id });
          done(error);
        }
      });

      LoggerConfig.info('Passport serialization configured');
    } catch (error) {
      LoggerConfig.error('Error configuring Passport serialization', { error });
      throw error;
    }
  }

  /**
   * Get strategy by provider
   */
  public getStrategy(provider: string): any {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Strategy not found for provider: ${provider}`);
    }
    return strategy;
  }

  /**
   * Get all initialized strategies
   */
  public getStrategies(): Map<string, any> {
    return this.strategies;
  }
}