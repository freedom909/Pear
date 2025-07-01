// strategies/session.ts
import passport from "passport";
import { UserDocument } from "../models/interface";

export function setupSessionSerialization() {
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as UserDocument).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    // Replace with your user lookup
    done(null, { id } as any);
  });
}
