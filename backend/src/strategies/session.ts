// strategies/session.ts
import 'reflect-metadata'; // ← これをファイルの一番上に追加

import passport from 'passport';
import { UserDocument } from '../models/user/user.types';
import UserService from '@/services/user.service';
import { container } from 'tsyringe';

const userService=container.resolve(UserService);
export function setupSessionSerialization() {
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as unknown as UserDocument).id);
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
