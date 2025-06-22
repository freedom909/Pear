// src/passport/index.ts
import passport from "passport";
import { AppleOAuthStrategy } from "../strategies/apple";
import { GoogleOAuthStrategy } from "../strategies/google";
import { FacebookOAuthStrategy } from "@/strategies/facebook";
import { TwitterOAuthStrategy } from "@/strategies/twitter";

export function initPassportStrategies() {
  new AppleOAuthStrategy().init(passport);
  new GoogleOAuthStrategy().init(passport);
  new FacebookOAuthStrategy().init(passport);
  new TwitterOAuthStrategy().init(passport);

  // add other strategies as needed
}
