import passport from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
// import { Profile as AppleProfile } from 'passport-apple';
import userService from '../services/user.service';
import bcrypt from 'bcryptjs';

export interface OAuthUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}


passport.use(
  new AppleStrategy(//
    {
      clientID: process.env.APPLE_CLIENT_ID!,    // Service ID
      teamID: process.env.APPLE_TEAM_ID!,        // Apple team ID
      keyID: process.env.APPLE_KEY_ID!,          // Apple key ID
      privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n'), // Apple private key as a string
      callbackURL: `${process.env.API_URL}/api/v1/auth/apple/callback`,
      passReqToCallback: true,
    } as any,
async (_req, _accessToken, _refreshToken, profile: any, done: any) => {
  try {
    const email = profile?.email || '';

    let user = await userService.findOne({ email });

    if (!user) {
      user = await userService.createUserFromOAuthProfile(
        {
          id: profile.id,
          emails: email,
          firstName: profile.name?.givenName || email.split('@')[0],
          lastName: profile.name?.familyName || '',
          avatar: '',
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        },
        'apple'
      );
    }
    return done(null, user);
  } catch (error) {
    return done(error as Error, null as any);
  }
}

  )
);

