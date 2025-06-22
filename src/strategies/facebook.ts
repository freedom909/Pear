import { PassportStatic } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import  userService  from '../services/user.service';
import { BaseStrategy } from './base';
import { Log } from '../logger/logger';
import { Request } from 'express';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';

export class FacebookOAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic): void {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID!,
          clientSecret: process.env.FACEBOOK_APP_SECRET!,
          callbackURL: '/api/v1/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'photos'],
          passReqToCallback: true,
        },
        async (
          _req: Request,
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          Log.info('FacebookStrategy', { accessToken, refreshToken, profile });

          try {
            let user = await userService.findOne({ facebookId: profile.id });
            if (!user) {
              user = await userService.create({
                provider: 'facebook',
                email: profile.emails?.[0]?.value || '',
                name: profile.name?.givenName || '',
                accessToken,
                refreshToken,
                profile: {
                  facebookId: profile.id,
                },
                avatar: profile.photos?.[0]?.value,
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
}
