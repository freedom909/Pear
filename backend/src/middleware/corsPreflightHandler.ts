import { Request, Response, NextFunction } from 'express';

export interface CorsOptions {
  /**
   * Allowed HTTP methods
   * @default ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
   */
  allowedMethods?: string[];
  /**
   * Allowed headers
   * @default ['Authorization', 'Content-Type', 'X-CSRF-Token']
   */
  allowedHeaders?: string[];
  /**
   * Allow credentials
   * @default true
   */
  credentials?: boolean;
  /**
   * Max age for preflight cache (seconds)
   * @default 86400 (24 hours)
   */
  maxAge?: number;
  /**
   * Custom preflight handler
   */
  handler?: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * Creates a CORS preflight handler middleware with configurable options
 */
export const createCorsPreflightHandler = (options?: CorsOptions) => {
  const {
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Authorization', 'Content-Type', 'X-CSRF-Token'],
    credentials = true,
    maxAge = 86400,
    handler
  } = options || {};

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','));
      res.setHeader('Access-Control-Allow-Credentials', String(credentials));
      res.setHeader('Access-Control-Max-Age', maxAge);

      // Allow custom handler to override behavior
      if (handler) {
        return handler(req, res, next);
      }

      // Standard preflight response
      return res.status(204).end();
    } catch (error) {
      console.error('CORS preflight error:', error);
      return res.status(500).json({
        error: 'CORS preflight failed',
        code: 'CORS_ERROR'
      });
    }
  };
};

/**
 * Default CORS preflight handler with common settings
 */
export const corsPreflightHandler = createCorsPreflightHandler();

/**
 * Strict CORS preflight handler for sensitive endpoints
 */
export const strictCorsPreflightHandler = createCorsPreflightHandler({
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 3600 // 1 hour
});

/**
 * Permissive CORS preflight handler for public APIs
 */
export const permissiveCorsPreflightHandler = createCorsPreflightHandler({
  allowedMethods: ['*'],
  allowedHeaders: ['*'],
  credentials: false
});