// src/errors/http-errors.ts
import { AppError } from './app-error';
import { ErrorCode } from './error-code';

export class BadRequestError extends AppError {
  constructor(code: ErrorCode = ErrorCode.BAD_REQUEST, message = 'Bad request') {
    super(code, message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: ErrorCode = ErrorCode.UNAUTHORIZED, message = 'Unauthorized') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: ErrorCode = ErrorCode.FORBIDDEN, message = 'Forbidden') {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(code: ErrorCode = ErrorCode.NOT_FOUND, message = 'Resource not found') {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(code: ErrorCode = ErrorCode.CONFLICT, message = 'Resource conflict') {
    super(code, message, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(code: ErrorCode = ErrorCode.TOO_MANY_REQUESTS, message = 'Too many requests') {
    super(code, message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, message = 'Internal server error') {
    super(code, message, 500);
  }
}
