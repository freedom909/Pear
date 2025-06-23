// src/passport/strategies/GoogleStrategy.ts
import { BaseStrategy } from "./base";
import { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userService  from "../services/user.service";

export class GoogleOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic): void {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: "/api/v1/auth/google/callback",
          passReqToCallback: true,
        },
        async (_req, _accessToken, _refreshToken, profile, done) => {
          try {
            let user = await userService.findOne({ googleId: profile.id });
            if (!user) {
              user = await userService.createUserFromOAuthProfile(profile  as any, 'google');
            }
            done(null, user);
          } catch (error) {
            done(error, null as any);
          }
        }
      )
    );
  }
}
