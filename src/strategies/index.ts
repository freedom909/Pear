export * from './base';
export * from './google';
export * from './facebook';
export * from './twitter';
export * from './apple';

// src/strategies/setupStrategies.ts
import passport from 'passport';
import { Strategy as AppleStrategy, Profile } from 'passport-apple';
import userService from '../services/user.service';


passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID!,       // Service ID
      teamID: process.env.APPLE_TEAM_ID!,           // Apple team ID
      keyID: process.env.APPLE_KEY_ID!,             // Apple key ID
      privateKeyString: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      callbackURL: `${process.env.API_URL}/api/v1/auth/apple/callback`,
      passReqToCallback: true,
    },
    async (
      _req,
      accessToken,
      refreshToken,
      _decodedIdToken,
      profile: Profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0]?.value || '';

        let user = await userService.findOne({ email });

        if (!user) {
          user = await userService.create({
            email,
            name: profile.displayName || email.split('@')[0],
            provider: 'apple',
            accessToken,
            refreshToken,
            avatar: profile.photos?.[0]?.value,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

