import { UserDocument } from '../models/user.model';

declare global {
  namespace Express {
    interface User extends UserDocument {}
    
    interface AuthenticatedRequest extends Request {
      isAuthenticated(): boolean;
      user?: User;
    }
  }
}