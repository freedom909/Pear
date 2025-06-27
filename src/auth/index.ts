import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { AppleOAuthStrategy } from "../strategies/apple";
import { GoogleOAuthStrategy } from "../strategies/google";
import { FacebookOAuthStrategy } from "../strategies/facebook";
import { TwitterOAuthStrategy } from "../strategies/twitter";
import User from "../models/user/user.model";
import OAuthConfig from "../config/oauth";
export function initPassportStrategies() {
  const oauthConfig = OAuthConfig.getConfigs();
  const userService = {
    // Since findOrCreate doesn't exist on IUserModel, we'll implement a simple findOrCreate logic
    findOrCreate: async (query: any, defaults: any) => {
      let user = await User.findOne(query);
      if (!user) {
        user = await User.create({ ...query, ...defaults });
      }
      return user;
    },
    findById: User.findById.bind(User),
    update: User.findOneAndUpdate.bind(User),
  };

  new AppleOAuthStrategy().init(passport);
  new GoogleOAuthStrategy().init(passport, oauthConfig.google, userService);
  new FacebookOAuthStrategy().init(passport, oauthConfig.facebook, userService);
  new TwitterOAuthStrategy().init(passport, oauthConfig.twitter, userService);

  // ✅ Add the local strategy here:
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }

          const isMatch = await (user as any).comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Also configure serialize/deserialize:
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