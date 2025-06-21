import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import User from "../models/user/model"; // Make sure path is correct

export function configurePassport(app: Express) {
  // Local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" }, // Important to set this or `email` will be interpreted as `username`
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

  // Optional: initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
}
