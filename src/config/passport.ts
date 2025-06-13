import passport from "passport";
import "./local.passport.js";
import "./facebook.passport.js";
import "./google.passport.js";
import "./twitter.passport.js";
import { jwtStrategy } from "./jwt.passport";

// Use JWT strategy
passport.use('jwt', jwtStrategy);

export default passport;