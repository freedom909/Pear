// src/passport/strategies/BaseStrategy.ts
import { PassportStatic } from "passport";

export abstract class BaseStrategy {
  abstract init(passport: PassportStatic): void;
}
