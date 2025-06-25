import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { AppleOAuthStrategy } from "../strategies/apple";
import { GoogleOAuthStrategy } from "../strategies/google";
import { FacebookOAuthStrategy } from "../strategies/facebook";
import { TwitterOAuthStrategy } from "../strategies/twitter";
import User from "../models/user/user.model"; // adjust the path as needed

export default passport;

export function initPassportStrategies() {
  new AppleOAuthStrategy().init(passport);
  new GoogleOAuthStrategy().init(passport);
  new FacebookOAuthStrategy().init(passport);
  new TwitterOAuthStrategy().init(passport);

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

          const isMatch = await user.comparePassword(password);
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
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
}