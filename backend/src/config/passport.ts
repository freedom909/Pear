import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import config from './config';
import logger from '../middleware/logger';
import UserService from '@/services/user.service';
import { container } from 'tsyringe';

const userService=container.resolve(UserService)

// JWT选项
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

// JWT策略
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // 查找用户
      const user = await userService.getUserById(jwt_payload.id);

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (error) {
      logger.error('Passport JWT验证错误:', error);
      return done(error, false);
    }
  })
);

export default passport;