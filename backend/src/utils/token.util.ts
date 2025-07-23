// utils/token.util.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtToken = process.env.JWT_SECRET || 'secure-random-string-here';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

const verifyToken = (token: string) =>
  jwt.verify(token, jwtToken) as { id: string };

/**
 * Helper to create JWT
 */

 function createToken(id: string): string {
  return jwt.sign({ id }, jwtToken, expiresIn as any);
}
export { createToken, verifyToken };