import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserDocument } from '@/models/user/user.types';

export function authenticateJWTMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.token;

  if (!token) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secure-random-string-here'
    ) as UserDocument;

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
     return;
  }
}
