import { PassportStatic } from 'passport';
import  userService  from '../services/user.service';
import { GoogleOAuthStrategy } from './google';
import { FacebookOAuthStrategy } from './facebook';
import { TwitterOAuthStrategy } from './twitter';

import { AppleOAuthStrategy } from './apple';
import  UserService from '../services/user.service';
import { BaseStrategy } from './base';
import { OAuthConfig } from '../models/interface/index';
import logger from '../utils/logger';


/**
 * OAuth strategy factory class
 */
export class OAuthStrategyFactory {
    protected strategies: Map<string, BaseStrategy> = new Map();
    protected passport: PassportStatic;
    protected userService: typeof UserService;
    protected configs: Record<string, OAuthConfig>;
  
    constructor(passport: PassportStatic,configs: Record<string, OAuthConfig>,userService: typeof UserService) {
      this.passport = passport;
      this.userService = userService;
      this.configs = configs;
    }
  /**
   * Initialize OAuth strategies
   */
  public initializeStrategies(configs: Record<string, OAuthConfig>): void {
    try {
      logger.info('Initializing OAuth strategies');

      // Initialize Google strategy if config exists
      if (configs.google) {
       
        if (configs.google?.clientID && configs.google?.clientSecret) {
        this.strategies.set(
          'google',
          new GoogleOAuthStrategy()
        );
        logger.info('Google OAuth strategy initialized');
      }
    }
      // Initialize Facebook strategy if config exists
      if (configs.facebook) {
        if (configs.facebook?.clientID && configs.facebook?.clientSecret) {
        this.strategies.set(
          'facebook',
          new FacebookOAuthStrategy()
        );
        logger.info('Facebook OAuth strategy initialized');
      }
    }

      // Initialize Twitter strategy if config exists
      if (configs.twitter) {
        if (configs.twitter?.clientID && configs.twitter?.clientSecret) {
        this.strategies.set(
          'twitter',
          new TwitterOAuthStrategy()
        );
        logger.info('Twitter OAuth strategy initialized');
      }
    }
      // Initialize Apple strategy if config exists
      if (configs.apple) {
        if (configs.apple?.clientID && configs.apple?.clientSecret) {
        this.strategies.set(
          'apple',
          new AppleOAuthStrategy()
        );
        logger.info('Apple OAuth strategy initialized');
      }
    }
      // Configure Passport serialization
      this.configurePassportSerialization();
      logger.info('OAuth strategies initialization completed');
    } catch (error) {
      logger.error('Error initializing OAuth strategies', { error });
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
       
        if (!user?.id) {
            return done(new Error('Invalid user object'));
          }
        logger.debug('Serializing user', { userId: user.id });
        done(null, user.id);
      });

      // Deserialize user from session
      this.passport.deserializeUser(async (id: string, done) => {
        try {
          const user = await userService.getUserById(id);//it said that Property 'getUserById' does not exist on type 'UserService', why?
          if (!user?.id) {
            return done(new Error('Invalid user object'));
          }
          logger.debug('Deserializing user', { userId: id });
          done(null, user);
        } catch (error) {
          logger.error('Error deserializing user', { error, userId: id });
          done(error);
        }
      });

      logger.info('Passport serialization configured');
    } catch (error) {
      logger.error('Error configuring Passport serialization', { error });
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

  public hasStrategy(provider: string): boolean {
    return this.strategies.has(provider);
  }
  public removeStrategy(provider: string): void {
    this.strategies.delete(provider);
  }
  
}

