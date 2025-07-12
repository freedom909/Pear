import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import config from './config';
import logger from '../middleware/logger';
import userService from '@/services/user.service';

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
      const user = await userService.findById(jwt_payload.sub);

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