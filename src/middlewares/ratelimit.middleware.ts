import rateLimit from 'express-rate-limit';
import { config } from '../config/app.config';
import { RateLimitError, ErrorCode } from '../config/error.config';

/**
 * Default rate limit configuration
 */
const defaultRateLimit = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // Default: 15 minutes
  max: config.security.rateLimitMaxRequests, // Default: 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    throw new RateLimitError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests from this IP, please try again later'
    );
  },
});

/**
 * Strict rate limit for sensitive routes (e.g., login, register)
 */
const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    throw new RateLimitError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many attempts, please try again later'
    );
  },
});

/**
 * Create custom rate limiter
 * @param options Rate limit options
 */
const createRateLimit = (options: Partial<rateLimit.Options>) => {
  return rateLimit({
    ...options,
    handler: (req, res, next) => {
      throw new RateLimitError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        options.message || 'Too many requests, please try again later'
      );
    },
  });
};

export const rateLimiters = {
  default: defaultRateLimit,
  strict: strictRateLimit,
  create: createRateLimit,
};