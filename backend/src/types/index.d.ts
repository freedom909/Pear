import { UserDocument } from '../models/user/user.types';

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}
