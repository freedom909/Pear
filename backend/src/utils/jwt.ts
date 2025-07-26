import * as jwt from 'jsonwebtoken';
import config from '../config/config';

interface TokenPayload {
  id: string;
  email: string;
  role?: string;
}

const jwtSecret = config.jwt.secret;
const expiresIn = config.jwt.expiresIn;
const JWT_COOKIE_EXPIRES = '90d';

if (!jwtSecret) {
  throw new Error('jwtSecret is not defined in config');
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '90d'
  });
};

export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth status check failed', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
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
  JWT_EXPIRES_IN: expiresIn,
  JWT_COOKIE_EXPIRES
};