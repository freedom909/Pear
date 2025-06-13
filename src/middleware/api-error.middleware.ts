import { Request, Response, NextFunction } from 'express';

/**
 * API Error Response Interface
 */
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: any[];
  stack?: string;
}

/**
 * API Error Handler Middleware
 * Handles errors for API routes and returns standardized JSON error responses
 */
export const apiErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || [];
    
    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      errors,
    };
    
    // Include stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }
    
    return res.status(status).json(errorResponse);
  }
  
  // Pass to next error handler if not an API route
  next(err);
};

/**
 * API Not Found Handler
 * Returns a standardized 404 response for API routes
 */
export const apiNotFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
    });
  }
  
  // Pass to next handler if not an API route
  next();
};