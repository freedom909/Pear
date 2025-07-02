import { Strategy as LocalStrategy } from 'passport-local';
import { PassportStatic } from 'passport';
import { BaseStrategy } from './base';
import { UserDocument } from '../models/interface';
import logger from '../middleware/logger';

export class LocalAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, _config: any, userService: any): void {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        async (email: string, password: string, done: any) => {
          try {
            // Find user by email
            const user = await userService.findOne({ email }).select('+password');

            // Check if user exists
            if (!user) {
              return done(null, false, { message: '无效的凭据' });
            }

            // Validate password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
              return done(null, false, { message: '无效的凭据' });
            }

            // Password is correct, return user
            return done(null, user);
          } catch (error) {
            logger.error('Local authentication error:', error);
            return done(error);
          }
        }
      )
    );

    // Serialize user for the session
    passport.serializeUser((user: UserDocument, done) => {
      done(null, user.id);
    });

    // Deserialize user from the session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await userService.findById(id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }
}