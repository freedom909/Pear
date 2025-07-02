import { EnvConfig } from './env';
import { OAuthConfig } from '../models/interface/index';
import logger from '../middleware/logger';

/**
 * OAuth configuration class
 */
export class OAuthConfiguration {
  /**
   * Get OAuth configurations for all providers
   * @throws Error if required environment variables are missing
   */
  static getConfigs(): Record<string, OAuthConfig> {
    try {
      const configs: Record<string, OAuthConfig> = {};

      // Google OAuth configuration
      const googleClientID = EnvConfig.get('GOOGLE_CLIENT_ID');
      const googleClientSecret = EnvConfig.get('GOOGLE_CLIENT_SECRET');
      const googleCallbackURL = EnvConfig.get('GOOGLE_CALLBACK_URL');

      if (googleClientID && googleClientSecret && googleCallbackURL) {
        configs.google = {
          provider: 'google',
          clientID: googleClientID,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackURL,
          scope: ['profile', 'email'],
          passReqToCallback: true,
        };
        logger.info('Google OAuth configuration loaded');
      }

      // Facebook OAuth configuration
      const facebookClientID = EnvConfig.get('FACEBOOK_CLIENT_ID');
      const facebookClientSecret = EnvConfig.get('FACEBOOK_CLIENT_SECRET');
      const facebookCallbackURL = EnvConfig.get('FACEBOOK_CALLBACK_URL');

      if (facebookClientID && facebookClientSecret && facebookCallbackURL) {
        configs.facebook = {
          provider: 'facebook',
          clientID: facebookClientID,
          clientSecret: facebookClientSecret,
          callbackURL: facebookCallbackURL,
          scope: ['email'],
          passReqToCallback: true,
        };
        logger.info('Facebook OAuth configuration loaded');
      }

      // Twitter OAuth configuration
      const twitterClientID = EnvConfig.get('TWITTER_CONSUMER_KEY');
      const twitterClientSecret = EnvConfig.get('TWITTER_CONSUMER_SECRET');
      const twitterCallbackURL = EnvConfig.get('TWITTER_CALLBACK_URL');

      if (twitterClientID && twitterClientSecret && twitterCallbackURL) {
        configs.twitter = {
          provider: 'twitter',
          clientID: twitterClientID,
          clientSecret: twitterClientSecret,
          callbackURL: twitterCallbackURL,
          passReqToCallback: true,
        };
        logger.info('Twitter OAuth configuration loaded');
      }

      // Apple OAuth configuration
      const appleClientID = EnvConfig.get('APPLE_CLIENT_ID');
      const appleClientSecret = EnvConfig.get('APPLE_CLIENT_SECRET');
      const appleCallbackURL = EnvConfig.get('APPLE_CALLBACK_URL');
      const appleTeamID = EnvConfig.get('APPLE_TEAM_ID');
      const appleKeyID = EnvConfig.get('APPLE_KEY_ID');
      const applePrivateKeyLocation = EnvConfig.get(
        'APPLE_PRIVATE_KEY_LOCATION'
      );

      if (
        appleClientID &&
        appleClientSecret &&
        appleCallbackURL &&
        appleTeamID &&
        appleKeyID &&
        applePrivateKeyLocation
      ) {
        configs.apple = {
          provider: 'apple',
          clientID: appleClientID,
          clientSecret: appleClientSecret,
          callbackURL: appleCallbackURL,
          teamID: appleTeamID,
          keyID: appleKeyID,
          privateKeyLocation: applePrivateKeyLocation,
          scope: ['email', 'name'],
          passReqToCallback: true,
        };
        logger.info('Apple OAuth configuration loaded');
      }

      if (Object.keys(configs).length === 0) {
        logger.warn(
          'No OAuth configurations loaded. Check your environment variables.'
        );
      } else {
        logger.info(
          `Loaded OAuth configurations for providers: ${Object.keys(configs).join(', ')}`
        );
      }

      return configs;
    } catch (error) {
      logger.error('Failed to load OAuth configurations:', error);
      throw new Error(
        'Failed to load OAuth configurations. Check your environment variables.'
      );
    }
  }
}
