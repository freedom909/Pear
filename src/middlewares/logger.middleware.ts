import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerConfig } from '../config/logger.config';
import { isDevelopment } from '../config/app.config';

/**
 * Generate a unique request ID
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = uuidv4();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Log request details
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log request
  LoggerConfig.info(`Incoming request`, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || 'anonymous',
  });

  // Log request body in development
  if (isDevelopment() && req.method !== 'GET') {
    const sanitizedBody = { ...req.body };
    
    // Sanitize sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.passwordConfirmation) sanitizedBody.passwordConfirmation = '[REDACTED]';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    
    LoggerConfig.debug(`Request body`, {
      requestId,
      body: sanitizedBody,
    });
  }

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    LoggerConfig[level](`Response sent`, {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

/**
 * Log errors
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  LoggerConfig.error(`Error processing request`, {
    requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: isDevelopment() ? err.stack : undefined,
    },
  });
  
  next(err);
};