// src/errors/error-response.ts
import { AppError } from './app-error';
import { ErrorCode } from './error-code';

export class ErrorResponse {
  statusCode: number;
  code: string;
  message: string;

  constructor(error: Error) {
    if (error instanceof AppError) {
      this.statusCode = error.statusCode;
      this.code = error.errorCode;
      this.message = error.message;
    } else {
      this.statusCode = 500;
      this.code = ErrorCode.INTERNAL_SERVER_ERROR;
      this.message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message || 'Internal server error';
    }
  }
}
