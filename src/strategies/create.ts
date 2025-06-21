import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as AppleStrategy } from 'passport-apple';
import { handleOAuthUser} from '../services/handleOAuthUser';
import dotenv from 'dotenv';
import passport, { Profile } from 'passport';
import {IUser, OAuthTokenInfo, UserDocument  } from '../models/interface/index';

dotenv.config();
export function createStrategies() {
  // Serialize user for the session
  passport.serializeUser((user: Express.User, done: (err: any, id?: any) => void) => {
    done(null, (user as UserDocument).id);
  });
  

  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      // TODO: Implement user lookup from database
      // const user = await UserModel.findById(id);
      // done(null, user);
      done(null, { id } as IUser);
    } catch (error) {
      done(error);
    }
  });

  // Initialize strategies for all supported providers
  const providers = ['google', 'facebook', 'twitter', 'apple'];
  
  providers.forEach(provider => {
    try {
      const strategy = createStrategy(provider);
      passport.use(provider, strategy);
      console.log(`Successfully initialized ${provider} strategy`);
    } catch (error) {
      console.error(`Failed to initialize ${provider} strategy:`, error);
    }
  });
}

// 提取公共的回调处理函数
async function commonCallback(profile: any, tokenInfo: OAuthTokenInfo, done: (error: any, user?: any) => void, provider: string) {
  try {
    const user = await handleOAuthUser(profile, tokenInfo);
    done(null, user);
  } catch (err) {
    console.error(`${provider} authentication error:`, err);
    done(err as Error);
  }
}

// 修改 createStrategy 函数
export function createStrategy(provider: string) {
  switch (provider) {
    case 'google':
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Missing required Google OAuth configuration');
      }

      return new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          const tokenInfo = {
            accessToken,
            refreshToken,
            provider: 'google'
          };
          commonCallback(profile as Profile, tokenInfo as OAuthTokenInfo, done, 'google');
        }
      );

    case 'twitter':
      if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
        throw new Error('Missing required Twitter OAuth configuration');
      }

      return new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CLIENT_ID,
          consumerSecret: process.env.TWITTER_CLIENT_SECRET,
          callbackURL: '/auth/twitter/callback',
        },
        (accessToken, tokenSecret, profile, done) => {
          const tokenInfo = {
            accessToken,
            tokenSecret,
            provider: 'twitter'
          };
          commonCallback(profile, tokenInfo as OAuthTokenInfo, done, 'twitter');
        }
      );

    case 'apple':
      const applePrivateKey = process.env.APPLE_PRIVATE_KEY;
      if (!applePrivateKey) {
        throw new Error('APPLE_PRIVATE_KEY is not defined in the environment');
      }
      // const formattedPrivateKey = applePrivateKey.replace(/\\n/g, '\n');

      const appleClientId = process.env.APPLE_CLIENT_ID;
      const appleTeamId = process.env.APPLE_TEAM_ID;
      const appleKeyId = process.env.APPLE_KEY_ID;

      if (!appleClientId || !appleTeamId || !appleKeyId) {
        throw new Error('Missing required Apple OAuth configuration');
      }

      return new AppleStrategy(
        {
          clientID: appleClientId,
          teamID: appleTeamId,
          keyID: appleKeyId,
          privateKeyLocation: './auth/AuthKey_XXXXXX.p8',
          callbackURL: process.env.APPLE_CALLBACK_URL,
          scope: ['name', 'email'],
          passReqToCallback: true,
        },
        async (
          _req,
          accessToken,
          refreshToken,
          _idToken,
          profile,
          done
        ) => {
          try {
            const tokenInfo = {
              accessToken,
              refreshToken,
              provider: 'apple'
            };
            await commonCallback(profile, tokenInfo, done, 'apple');
          } catch (err) {
            console.error('Apple authentication error:', err);
            done(err as Error); // ✅ this is now valid
          }
        }
      );
      
    
          

    case 'facebook':
      if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET) {
        throw new Error('Missing required Facebook OAuth configuration');
      }

      return new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          callbackURL: '/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        (accessToken, refreshToken, profile, done) => {
          const tokenInfo = {
            accessToken,
            refreshToken,
            provider: 'facebook'
          };
          commonCallback(profile, tokenInfo, done, 'facebook');
        }
      );

    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}