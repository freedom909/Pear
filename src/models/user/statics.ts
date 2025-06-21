import { Model} from 'mongoose';
import { UserDocument } from '../interface';

export interface IUserModel extends Model<UserDocument> {
    findByEmail(email: string): Promise<UserDocument | null>;
    findByVerificationToken(token: string): Promise<UserDocument | null>;
    findByPasswordResetToken(token: string): Promise<UserDocument | null>;
    findByRefreshToken(token: string): Promise<UserDocument | null>;
    isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
  }