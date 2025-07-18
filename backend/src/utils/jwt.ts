import * as jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError';
import { ErrorCode } from '../errors/error-code';
import config from '../config/config';

interface TokenPayload {
  id: string;
  email: string;
  role?: string;
}

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;
const JWT_COOKIE_EXPIRES = '90d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in config');
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '90d'
  });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new AppError(
        { message: 'Invalid or expired token',
             code: ErrorCode.INVALID_TOKEN,
             details: error 
            });
        
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeaders = (headers: any): string | null => {
  const authHeader = headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

export default {
  signToken,
  verifyToken,
  decodeToken,
  getTokenFromHeaders,
  JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES
};