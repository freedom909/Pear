import { Strategy as TwitterStrategy } from 'passport-twitter';
import { PassportStatic } from 'passport';
import { BaseStrategy } from './base';

/**
 * ** Twitter OAuth Strategy
 */// src/passport/strategies/AppleStrategy.ts

export class TwitterOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, config: any, userService: any): void {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: config.consumerKey,
          consumerSecret: config.consumerSecret,
          callbackURL: config.callbackURL,
          passReqToCallback: true,
        },
        async (_req, accessToken, refreshToken, profile, done) => {
          try {
            let user = await userService.findOne({ twitterId: profile.id });
            if (!user) {
              user = await userService.create({
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || profile.username || '',
                provider: 'twitter',
                accessToken,
                refreshToken,
                profile: {
                  twitterId: profile.id,
                } ,
                avatar: profile.photos?.[0]?.value,
              });
            }
            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }
}