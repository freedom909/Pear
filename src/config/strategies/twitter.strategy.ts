import { Strategy as TwitterStrategy } from 'passport-twitter';
import { PassportStatic } from 'passport';
import { BaseOAuthStrategy, OAuthConfig } from './base.strategy';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { LoggerConfig } from '../logger.config';

export class TwitterOAuthStrategy extends BaseOAuthStrategy {
  constructor(
    private readonly passport: PassportStatic,
    private readonly oauthConfig: OAuthConfig,
    private readonly userService: UserService,
  ) {
    super();
    this.init();
    LoggerConfig.debug('TwitterOAuthStrategy initialized', { 
      callbackUrl: this.oauthConfig.callbackUrl 
    });
  }

  /**
   * Initialize the strategy
   */
  private init(): void {
    const strategy = this.configureStrategy();
    this.passport.use('twitter', strategy);
  }

  configureStrategy(): TwitterStrategy {
    return new TwitterStrategy(
      {
        consumerKey: this.oauthConfig.clientId,
        consumerSecret: this.oauthConfig.clientSecret,
        callbackURL: this.oauthConfig.callbackUrl,
        includeEmail: true, // Request email from Twitter API if available
      },
      async (token, tokenSecret, profile, done) => {
        try {
          // Find existing user or create a new one
          const existingUser = await this.userService.findByProviderId(
            'twitter',
            profile.id,
          );

          if (existingUser) {
            // Update existing user with latest profile info
            existingUser.name = profile.displayName;
            existingUser.avatar = profile.photos?.[0]?.value || '';
            // Twitter doesn't always provide email
            if (profile.emails && profile.emails.length > 0) {
              existingUser.email = profile.emails[0].value;
            }
            existingUser.lastLogin = new Date();
            
            const updatedUser = await existingUser.save();
            return done(null, updatedUser);
          }

          // Create new user
          const newUser = new User({
            name: profile.displayName,
            // Twitter doesn't always provide email
            email: profile.emails?.[0]?.value || `twitter_${profile.id}@placeholder.com`,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'twitter',
            providerId: profile.id,
            lastLogin: new Date(),
          });

          const savedUser = await newUser.save();
          return done(null, savedUser);
        } catch (error) {
          return done(error as Error);
        }
      },
    );
  }
}