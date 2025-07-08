// strategies/session.ts
import passport from 'passport';
import { UserDocument } from '../models/interface';
import userService from '@/services/user.service';

export function setupSessionSerialization() {
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as UserDocument).id);
  });

  passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});
}
