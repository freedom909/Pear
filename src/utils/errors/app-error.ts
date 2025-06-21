// src/errors/app-error.ts
import { ErrorCode } from './error-code';

export class AppError extends Error {
  statusCode: number;
  errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
