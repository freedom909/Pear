// passport/setupStrategies.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { userService } from '../services/user.service';
import { UserDocument } from '@/models/interface';

// Shared callback logic for all OAuth strategies
async function oauthCallback(
    profile: any,
    provider: string,
    accessToken: string,
    refreshToken: string
  ) {
    let user = await userService.findOne({ [`${provider}Id`]: profile.id });
  
    if (!user) {
   
  
      user = await userService.create({
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || profile.username || '',
        provider,
        accessToken,
        refreshToken,
        [`${provider}Id`]: profile.id,       
      }) as UserDocument;
    } else {
      // 确保 _id 是 string 类型
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
    }
  
    return user;
  }
  

// Factory to setup any OAuth2 strategy
function setupOAuthStrategy(
  StrategyClass: any,
  config: any,
  providerName: string,
) {
  passport.use(
    new StrategyClass(
      {
        ...config,
        passReqToCallback: true, // include req if you need it
      },
      async (
        _req: any,
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          const user = await oauthCallback(
            profile,
            providerName,
            _accessToken,
            _refreshToken,
          );
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );
}

// Export a setup function that you can call once in app.ts
export function initPassportStrategies() {
  // Google
  setupOAuthStrategy(GoogleStrategy, {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, 'google');

  // Facebook
  setupOAuthStrategy(FacebookStrategy, {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails'],
  }, 'facebook');

  // Apple
  setupOAuthStrategy(AppleStrategy, {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: '/auth/apple/callback',
    scope: ['name', 'email'],
  }, 'apple');

  // Twitter
  setupOAuthStrategy(TwitterStrategy, {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/callback',
    includeEmail: true,
  }, 'twitter');
}
