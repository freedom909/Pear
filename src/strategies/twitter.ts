import { Strategy as TwitterStrategy } from 'passport-twitter';
import { PassportStatic } from 'passport';
import { BaseOAuthStrategy } from './base';
import { UserService } from '../services/user';
import { Log } from '../logger/logger';
import User from '../models/user/model';
import { OAuthConfig } from 'models/user/index';
import { IUserModel, IUserProfile } from '../models/interface';
import { OAuthConfiguration } from 'config/oauth';
/**
 * ** Twitter OAuth Strategy
 */



export class TwitterOAuthStrategy extends BaseOAuthStrategy {
  protected passport: PassportStatic;
  protected config: OAuthConfig;
  protected userService: UserService;
  constructor(
      passport: PassportStatic, config: OAuthConfig, userService: UserService
    ) {
      super(config, userService);
      this.passport = passport;// Property 'passport' does not exist on type 'GoogleOAuthStrategy'
      this.userService = userService;
      this.config = config;
    }

    async init(): Promise<void> {
      const strategy = this.configureStrategy();
      this.passport.use('twitter', strategy);
    }
  
    configureStrategy(): TwitterStrategy {
      return new TwitterStrategy(
        {
          consumerKey: this.config.clientID,
          consumerSecret: this.config.clientSecret,
          callbackURL: this.config.callbackURL,
          includeEmail: true, // Request email from Twitter API if available
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Find existing user or create a new one
            const existingUser = await UserService.findUserByProviderId( 
              'twitter',
              profile.id,
            ) as IUserProfile | null;
  
            if (existingUser) {
              // Update existing user with latest profile info
              existingUser.firstName = profile.name?.givenName || '';
              existingUser.lastName = profile.displayName;
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