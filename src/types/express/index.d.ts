import { Request } from 'express';

declare global {
  namespace Express {
    interface AuthenticatedRequest extends Request {
      authInfo?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
        scope: string;
      };
    }
  }
}

// This needs to be here to make this a module
export {};