/**
 * Error codes for the application
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_TOKEN = 'MISSING_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ALREADY_AUTHENTICATED = 'ALREADY_AUTHENTICATED',
  GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED',
  INVALID_STATE = 'INVALID_STATE',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Other errors
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}

/**
 * Base application error class
 */
export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  
  constructor(code: ErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(code: ErrorCode = ErrorCode.BAD_REQUEST, message: string = 'Bad request') {
    super(code, message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(code: ErrorCode = ErrorCode.UNAUTHORIZED, message: string = 'Unauthorized') {
    super(code, message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(code: ErrorCode = ErrorCode.FORBIDDEN, message: string = 'Forbidden') {
    super(code, message, 403);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(code: ErrorCode = ErrorCode.NOT_FOUND, message: string = 'Resource not found') {
    super(code, message, 404);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends AppError {
  constructor(code: ErrorCode = ErrorCode.CONFLICT, message: string = 'Resource conflict') {
    super(code, message, 409);
  }
}

/**
 * 429 Too Many Requests Error
 */
export class TooManyRequestsError extends AppError {
  constructor(code: ErrorCode = ErrorCode.TOO_MANY_REQUESTS, message: string = 'Too many requests') {
    super(code, message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, message: string = 'Internal server error') {
    super(code, message, 500);
  }
}

/**
 * Error response formatter
 */
export class ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  
  constructor(error: Error) {
    if (error instanceof AppError) {
      this.statusCode = error.statusCode;
      this.code = error.code;
      this.message = error.message;
    } else {
      this.statusCode = 500;
      this.code = ErrorCode.INTERNAL_SERVER_ERROR;
      this.message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message || 'Internal server error';
    }
  }
}