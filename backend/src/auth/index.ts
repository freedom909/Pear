import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserDocument } from '../models/user/user.types';
import { AppleOAuthStrategy } from '../strategies/apple';
import { GoogleOAuthStrategy } from '../strategies/google';
import { FacebookOAuthStrategy } from '../strategies/facebook';
import { TwitterOAuthStrategy } from '../strategies/twitter';
import User from '../models/user/user.model';
import { OAuthConfiguration } from '../config/oauth';
import { container } from 'tsyringe';
import  UserService  from '../services/user.service';

export function initPassportStrategies() {
  const oauthConfig = OAuthConfiguration.getConfigs();

  const userService = container.resolve(UserService);

  new AppleOAuthStrategy().init(passport, oauthConfig.apple, userService);
  new GoogleOAuthStrategy().init(passport, oauthConfig.google, userService);
  new FacebookOAuthStrategy().init(passport, oauthConfig.facebook, userService);
  new TwitterOAuthStrategy().init(passport, oauthConfig.twitter, userService);

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) return done(null, false, { message: 'Incorrect email.' });

          const isMatch = await (user as any).comparePassword(password);
          if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

          return done(null, user as unknown as UserDocument);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done: any) => done(null, user.id));
  passport.deserializeUser(async (id: any, done: any) => {
    try {
      const user = await User.findById(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
}
