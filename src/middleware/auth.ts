import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/interface/index'; // or wherever you keep UserRole
import userService from '../services/user.service';
import config from '../config/config';
import { ErrorResponse } from '@/utils/error';
import logger from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

// 1️⃣ protect — check JWT, set req.user
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) :Promise<Response|void>=> {

  let token: string | undefined;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { sub: string };
    const user = await userService.findById(decoded.sub); // Fetch the user by id
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id as string,
      role: user.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// 2️⃣ authorize — check if user role matches one of the allowed roles
export const authorize = (...roles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Requires role: ${roles}` });
      }

      next();
    } catch (err) {
      logger.error('Authorize error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};


interface JwtPayload {
  id: string;
}

// /**
//  * Protect routes by verifying JWT token
//  */
export const auth = async (req: any, _res: Response, next: NextFunction) => {
  let token;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route'as any));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtPayload;

    // Get user from token
// Since 'User' is not found, we assume there's a service similar to the previous part of the code
// Let's use userService to find the user
req.user = await userService.findById(decoded.id);

    next();
  } catch (err) {
    logger.error('JWT verification error:', err);
// Assuming ErrorResponse constructor can accept only one argument, adjust accordingly
const error = new ErrorResponse('Not authorized to access this route' as any);
return next(error);
  }
};

// /**
//  * Grant access to specific roles
//  */
export const role = (...roles: string[]) => {
  return (req: any, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route` as any,
          
        )
      );
    }
    next();
  };
};