
// import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
  GUEST = 'guest',
  MODERATOR = 'moderator'
}

export function role(requiredRole: UserRole) {
  return (req: any, res: any, next: (err?: any) => void) => {
    if (req.user?.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
