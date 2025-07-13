// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

export interface DecodedUserToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Verifies the auth_token cookie.
 * @param cookies Request cookies object.
 * @returns Decoded token if valid, otherwise null.
 */
export function verifyAuthToken(cookies: NextApiRequestCookies): DecodedUserToken | null {
  const token = cookies.auth_token;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUserToken;
    return decoded;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
