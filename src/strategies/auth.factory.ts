import { PassportStatic } from 'passport';
import { UserService } from '../services/user.ts';
import { GoogleOAuthStrategy } from './google.ts';
import { FacebookOAuthStrategy } from './facebook.ts';
import { TwitterOAuthStrategy } from './twitter.ts';

import { AppleOAuthStrategy } from './apple.ts';

import { BaseOAuthStrategy } from './base.ts';
import { OAuthConfig } from './base.ts';
import { Log} from '../logger/logger.ts';


/**
 * OAuth strategy factory class
 */
export class OAuthStrategyFactory {
    protected strategies: Map<string, BaseOAuthStrategy> = new Map();
    protected passport: PassportStatic;
    protected userService: UserService;
    protected configs: Record<string, OAuthConfig>;
  
    constructor(passport: PassportStatic,configs: Record<string, OAuthConfig>,userService: UserService) {
      this.passport = passport;
      this.userService = userService;
      this.configs = configs;
    }
  /**
   * Initialize OAuth strategies
   */
  public initializeStrategies(configs: Record<string, OAuthConfig>): void {
    try {
      Log.info('Initializing OAuth strategies');

      // Initialize Google strategy if config exists
      if (configs.google) {
       
        if (configs.google?.clientID && configs.google?.clientSecret) {
        this.strategies.set(
          'google',
          new GoogleOAuthStrategy(this.passport, configs.google, this.userService)
        );
        Log.info('Google OAuth strategy initialized');
      }
    }
      // Initialize Facebook strategy if config exists
      if (configs.facebook) {
        if (configs.facebook?.clientID && configs.facebook?.clientSecret) {
        this.strategies.set(
          'facebook',
          new FacebookOAuthStrategy(this.passport, configs.facebook, this.userService)
        );
        Log.info('Facebook OAuth strategy initialized');
      }
    }

      // Initialize Twitter strategy if config exists
      if (configs.twitter) {
        if (configs.twitter?.clientID && configs.twitter?.clientSecret) {
        this.strategies.set(
          'twitter',
          new TwitterOAuthStrategy(this.passport, configs.twitter, this.userService)
        );
        Log.info('Twitter OAuth strategy initialized');
      }
    }
      // Initialize Apple strategy if config exists
      if (configs.apple) {
        if (configs.apple?.clientID && configs.apple?.clientSecret) {
        this.strategies.set(
          'apple',
          new AppleOAuthStrategy(this.passport, configs.apple, this.userService)
        );
        Log.info('Apple OAuth strategy initialized');
      }
    }
      // Configure Passport serialization
      this.configurePassportSerialization();
      Log.info('OAuth strategies initialization completed');
    } catch (error) {
      Log.error('Error initializing OAuth strategies', { error });
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
        Log.debug('Serializing user', { userId: user.id });
        done(null, user.id);
      });

      // Deserialize user from session
      this.passport.deserializeUser(async (id: string, done) => {
        try {
        
          const user = await this.userService.findUserById(id);
          if (!user?.id) {
            return done(new Error('Invalid user object'));
          }
          Log.debug('Deserializing user', { userId: id });
          done(null, user);
        } catch (error) {
          Log.error('Error deserializing user', { error, userId: id });
          done(error);
        }
      });

      Log.info('Passport serialization configured');
    } catch (error) {
      Log.error('Error configuring Passport serialization', { error });
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

