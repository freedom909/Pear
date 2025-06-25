// src/strategies/base.ts
import { PassportStatic } from "passport";

import { OAuthConfig } from "../models/interface";

/**
 * Base strategy abstract class
 * All OAuth strategies should extend this class
 */
export abstract class BaseStrategy {
  /**
   * Initialize the strategy with passport
   * @param passport Passport instance
   * @param config OAuth configuration
   * @param userService User service instance
   */
  abstract init(
    passport: PassportStatic, 
    config: OAuthConfig, 
    userService: any
  ): void;
}