// src/errors/utils.ts
import { AppError } from './app-error';
import { ErrorCode } from './error-code';

export const throwError = (code: ErrorCode, message: string, status: number = 400): never => {
  throw new AppError(code, message, status);
};