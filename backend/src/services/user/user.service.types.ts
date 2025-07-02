import { IUser } from '../../models/user/user.types'; // import { IUser } from '../../models/user/user.types';

export interface UserService {
  findOrCreateUser(email: string, password: string): Promise<IUser>;
  getUser(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByResetToken(token: string): Promise<IUser | null>;

  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<IUser[]>;
}
