import { PassportStatic } from 'passport';
import { GoogleOAuthStrategy } from './google';
import { FacebookOAuthStrategy } from './facebook';
import { TwitterOAuthStrategy } from './twitter';
import { AppleOAuthStrategy } from './apple';
import { LocalAuthStrategy } from './local';
import userService from '../services/user.service';
import { BaseStrategy } from './base';
import { OAuthConfig } from '../models/interface/index';
import logger from '../middleware/logger';

/**
 * Authentication strategy factory class
 */
export class AuthStrategyFactory {
  protected strategies: Map<string, BaseStrategy> = new Map();
  protected passport: PassportStatic;
  protected userService: typeof userService;
  protected configs: Record<string, OAuthConfig>;

  constructor(
    passport: PassportStatic,
    configs: Record<string, OAuthConfig>,
    userService: any
  ) {
    this.passport = passport;
    this.configs = configs;
    this.userService = userService;
  }
  /**
   * Initialize OAuth strategies
   */
  public initializeStrategies(): void {
    try {
      logger.info('Initializing OAuth strategies');

      // Initialize Google strategy if config exists
      if (this.configs.google) {
        if (
          this.configs.google?.clientID &&
          this.configs.google?.clientSecret
        ) {
          const googleStrategy = new GoogleOAuthStrategy();
          googleStrategy.init(
            this.passport,
            this.configs.google,
            this.userService
          );
          this.strategies.set('google', googleStrategy);
          logger.info('Google OAuth strategy initialized');
        }
      }

      // Initialize Facebook strategy if config exists
      if (this.configs.facebook) {
        if (
          this.configs.facebook?.clientID &&
          this.configs.facebook?.clientSecret
        ) {
          const facebookStrategy = new FacebookOAuthStrategy();
          facebookStrategy.init(
            this.passport,
            this.configs.facebook,
            this.userService
          );
          this.strategies.set('facebook', facebookStrategy);
          logger.info('Facebook OAuth strategy initialized');
        }
      }

      // Initialize Twitter strategy if config exists
      if (this.configs.twitter) {
        if (
          this.configs.twitter?.clientID &&
          this.configs.twitter?.clientSecret
        ) {
          const twitterStrategy = new TwitterOAuthStrategy();
          twitterStrategy.init(
            this.passport,
            this.configs.twitter,
            this.userService
          );
          this.strategies.set('twitter', twitterStrategy);
          logger.info('Twitter OAuth strategy initialized');
        }
      }

      // Initialize Apple strategy if config exists
      if (this.configs.apple) {
        if (
          this.configs.apple?.clientID &&
          this.configs.apple?.teamID &&
          this.configs.apple?.keyID &&
          this.configs.apple?.privateKeyLocation
        ) {
          try {
            const appleStrategy = new AppleOAuthStrategy();
            appleStrategy.init(
              this.passport,
              this.configs.apple,
              this.userService
            );
            this.strategies.set('apple', appleStrategy);
            logger.info('Apple OAuth strategy initialized');
          } catch (error) {
            logger.error('Error initializing Apple OAuth strategy', { error });
          }
        } else {
          logger.warn('Apple OAuth configuration incomplete, skipping initialization');
        }
      }

      // Initialize Local authentication strategy
      const localStrategy = new LocalAuthStrategy();
      localStrategy.init(this.passport, {}, this.userService);
      this.strategies.set('local', localStrategy);
      logger.info('Local authentication strategy initialized');

      logger.info('Authentication strategies initialization completed');
    } catch (error) {
      logger.error('Error initializing OAuth strategies', { error });
      throw error;
    }
  }

  /**
   * Get OAuth strategy by provider name
   * @param provider The OAuth provider name (e.g., 'google', 'facebook', 'twitter', 'apple')
   * @returns The OAuth strategy instance
   * @throws Error if strategy is not found for the given provider
   */
  public getStrategy(provider: string): BaseStrategy {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Strategy not found for provider: ${provider}`);
    }
    return strategy;
  }

  /**
   * Get all initialized OAuth strategies
   * @returns Map of provider names to their corresponding strategy instances
   */
  public getStrategies(): Map<string, BaseStrategy> {
    return this.strategies;
  }

  public hasStrategy(provider: string): boolean {
    return this.strategies.has(provider);
  }

  public removeStrategy(provider: string): void {
    this.strategies.delete(provider);
  }
}