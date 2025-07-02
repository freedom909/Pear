// src/strategies/apple.ts
import { BaseStrategy } from './base';
import { PassportStatic } from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import userService from '../services/user.service';

export class AppleOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic): void {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID!,
          teamID: process.env.APPLE_TEAM_ID!,
          keyID: process.env.APPLE_KEY_ID!,
          privateKey: process.env.APPLE_PRIVATE_KEY!,
          callbackURL: '/api/v1/auth/apple/callback',
          scope: ['email', 'name'],
          passReqToCallback: true,
        } as any,
        async (
          _req: any,
          accessToken: any,
          refreshToken: any,
          _idToken: any,
          profile: any,
          done: any
        ) => {
          try {
            let user = await userService.findOne({ appleId: profile.id });
            if (!user) {
              user = await userService.create({
                provider: 'apple',
                email: profile.emails[0].value,
                name: profile.name.givenName,
                accessToken, // pass the token too
                refreshToken, // pass the refresh token too
                profile: {
                  appleId: profile.id, // ✅ store under appleId
                },
                avatar: profile.photos[0].value,
              });
            }
            done(null, user);
          } catch (error) {
            done(error as any, null as any);
          }
        }
      )
    );
  }
}
