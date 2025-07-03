import { Strategy as LocalStrategy } from 'passport-local';
import { PassportStatic } from 'passport';
import { BaseStrategy } from './base';
import logger from '../middleware/logger';

export class LocalAuthStrategy extends BaseStrategy {
  init(passport: PassportStatic, _config: any, userService: any): void {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        async (email: string, password: string, done) => {
          try {
            // Find user by email
            const user = await userService.findOne({ email }).select('+password');
            if (!user) {
              return done(null, false, { message: '无效的凭据' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
              return done(null, false, { message: '无效的凭据' });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Local authentication error:', error);
            return done(error);
          }
        }
      )
    );

    passport.serializeUser(
      (user, done) => {
        done(null, (user as any)._id);
      }
    );

    passport.deserializeUser(
      async (id: string, done) => {
        try {
          const user = await userService.findById(id);
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    );
  }
}
