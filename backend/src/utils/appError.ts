import { ErrorCode } from '../errors/error-code';

export default class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number, code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}