import { UserService } from '../../services/user.service';
import { IUser } from '../../models/user.model';
import { LoggerConfig } from '../logger.config';

/**
 * OAuth profile interface
 */
export interface OAuthProfile {
  id: string;
  provider: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
}

/**
 * OAuth configuration interface
 */
export interface OAuthConfig {
  provider: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: string[];
  // Apple specific fields
  teamId?: string;
  keyId?: string;
  privateKeyLocation?: string;
}

/**
 * Base OAuth strategy class
 */
export abstract class BaseOAuthStrategy {
  constructor(
    protected readonly config: OAuthConfig,
    protected readonly userService: UserService
  ) {}

  /**
   * Configure the strategy
   */
  protected abstract configureStrategy(): void;

  /**
   * Validate OAuth profile and return user
   */
  protected async validateOAuthProfile(
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile
  ): Promise<IUser> {
    try {
      LoggerConfig.info(`Validating ${profile.provider} profile`, {
        profileId: profile.id,
        provider: profile.provider,
      });

      // Find user by provider ID
      let user: IUser | null = null;

      switch (profile.provider) {
        case 'google':
          user = await this.userService.findUserByGoogleId(profile.id);
          break;
        case 'facebook':
          user = await this.userService.findUserByFacebookId(profile.id);
          break;
        case 'twitter':
          user = await this.userService.findUserByTwitterId(profile.id);
          break;
        case 'apple':
          user = await this.userService.findUserByAppleId(profile.id);
          break;
        default:
          throw new Error(`Unsupported provider: ${profile.provider}`);
      }

      // If user exists, return it
      if (user) {
        LoggerConfig.info(`User found for ${profile.provider} profile`, {
          userId: user.id,
          provider: profile.provider,
        });
        return user;
      }

      // If user doesn't exist, check if email exists
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      
      if (email) {
        user = await this.userService.findUserByEmail(email);
        
        if (user) {
          // Link provider ID to existing user
          LoggerConfig.info(`Linking ${profile.provider} profile to existing user`, {
            userId: user.id,
            provider: profile.provider,
          });
          
          switch (profile.provider) {
            case 'google':
              user = await this.userService.linkGoogleAccount(user.id, profile.id);
              break;
            case 'facebook':
              user = await this.userService.linkFacebookAccount(user.id, profile.id);
              break;
            case 'twitter':
              user = await this.userService.linkTwitterAccount(user.id, profile.id);
              break;
            case 'apple':
              user = await this.userService.linkAppleAccount(user.id, profile.id);
              break;
          }
          
          return user;
        }
      }

      // If user doesn't exist, create a new one
      LoggerConfig.info(`Creating new user for ${profile.provider} profile`, {
        provider: profile.provider,
      });
      
      const firstName = profile.name?.givenName || 'User';
      const lastName = profile.name?.familyName || profile.id.substring(0, 5);
      const photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined;
      
      const userData = {
        email: email || `${profile.id}@${profile.provider}.user`,
        firstName,
        lastName,
        photo,
        verified: true, // OAuth users are considered verified
      };
      
      switch (profile.provider) {
        case 'google':
          return await this.userService.createGoogleUser(userData, profile.id);
        case 'facebook':
          return await this.userService.createFacebookUser(userData, profile.id);
        case 'twitter':
          return await this.userService.createTwitterUser(userData, profile.id);
        case 'apple':
          return await this.userService.createAppleUser(userData, profile.id);
        default:
          throw new Error(`Unsupported provider: ${profile.provider}`);
      }
    } catch (error) {
      LoggerConfig.error(`Error validating ${profile.provider} profile`, { error });
      throw error;
    }
  }
}