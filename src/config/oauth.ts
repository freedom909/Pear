import { EnvConfig } from './env';
import { OAuthConfig } from '../models/interface/index';

/**
 * OAuth configuration class
 */
export class OAuthConfiguration {
  /**
   * Get OAuth configurations for all providers
   */
  static getConfigs(): Record<string, OAuthConfig> {
    return {
      google: {
        provider: 'google',
        clientID: EnvConfig.get('GOOGLE_CLIENT_ID'),
        clientSecret: EnvConfig.get('GOOGLE_CLIENT_SECRET'),
        callbackURL: EnvConfig.get('GOOGLE_CALLBACK_URL'),
        scope: ['profile', 'email']
      },
      facebook: {
        provider: 'facebook',
        clientID: EnvConfig.get('FACEBOOK_CLIENT_ID'),
        clientSecret: EnvConfig.get('FACEBOOK_CLIENT_SECRET'),
        callbackURL: EnvConfig.get('FACEBOOK_CALLBACK_URL'),
        scope: ['email'],
        //passReqToCallback: true, // 👈 明示的に追加
      },
      twitter: {
        provider: 'twitter',
        clientID: EnvConfig.get('TWITTER_CONSUMER_KEY'),
        clientSecret: EnvConfig.get('TWITTER_CONSUMER_SECRET'),
        callbackURL: EnvConfig.get('TWITTER_CALLBACK_URL')
      },
      apple: {
        provider: 'apple',
        clientID: EnvConfig.get('APPLE_CLIENT_ID'),
        clientSecret: EnvConfig.get('APPLE_CLIENT_SECRET'),
        callbackURL: EnvConfig.get('APPLE_CALLBACK_URL'),
        teamID: EnvConfig.get('APPLE_TEAM_ID'),
        keyID: EnvConfig.get('APPLE_KEY_ID'),
        privateKeyLocation: EnvConfig.get('APPLE_PRIVATE_KEY_LOCATION'),
        scope: ['email', 'name'],
        passReqToCallback: true
      }
    };
  }
}