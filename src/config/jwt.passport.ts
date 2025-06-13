import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User';

/**
 * JWT Strategy Configuration
 * This strategy is used for API authentication using JWT tokens
 */
export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secret',
  },
  async (payload: any, done: any) => {
    try {
      // Find the user by id from the JWT payload
      const user = await User.findById(payload.id);

      if (!user) {
        return done(null, false);
      }

      // Return user if found
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);