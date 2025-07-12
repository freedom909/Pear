import {  NextFunction } from 'express';
import logger  from './logger';

/**
 * Middleware to handle CORS preflight OPTIONS requests
 * This is needed for routes that require authentication or have custom headers
 */
export const corsPreflightHandler = (req:any, res:any, next:NextFunction) =>{
  // Check if it's an OPTIONS request
  if (req.method === 'OPTIONS') {
    logger.log('debug', 'Handling CORS preflight request', {
      path: req.path,
      origin: req.headers.origin
    });

    // Set CORS headers
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const requestOrigin = req.headers.origin || '';
    
    // Allow the frontend URL or localhost in development
    if (requestOrigin === allowedOrigin || 
        (process.env.NODE_ENV === 'development' && 
         (requestOrigin.startsWith('http://localhost:') || 
          requestOrigin.startsWith('http://127.0.0.1:')))) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      
      // End the request
      return res.status(204).end();
    } else {
      logger.warn('CORS preflight blocked for origin', { origin: requestOrigin });
      return res.status(403).json({ 
        success: false,
        message: 'CORS not allowed for this origin'
      });
    }
  }
  // Not an OPTIONS request, continue to the next middleware
  next();
};