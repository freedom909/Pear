// src/config/passport.config.ts
import passport, { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import userService from '../services/user.service';
import { AuthStrategyFactory } from '../strategies/auth.factory';
import { OAuthConfiguration } from '../config/oauth';
import logger from '../middleware/logger';
import { UserDocument } from '../models/user/user.model';

export class PassportConfig {
  private static oauthFactory: AuthStrategyFactory;

  /**
   * Initialize all passport strategies
   */
  static initialize(): void {
    // Initialize OAuth strategies
    this.oauthFactory = new AuthStrategyFactory(
      passport,
      OAuthConfiguration.getConfigs(),
      userService
    );

    // Register OAuth strategies
    this.oauthFactory.initializeStrategies();

    // Initialize Local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done): Promise<void> => {
      try {
        const user = (await userService.findOne({
          email: email.toLowerCase(),
        })) as unknown as UserDocument;

        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user as any);
      } catch (error) {
        return done(error);
      }
    }
  )
);


    // Configure serialize/deserialize
    passport.serializeUser((user: any, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await userService.findById(id as string);
        done(null, user || null);
      } catch (error) {
        done(error);
      }
    });

    logger.info('✅ Passport strategies initialized');
  }

  /**
   * Get the passport instance to be used in app setup
   */
  static getPassport(): PassportStatic {
    return passport;
  }
}
