import User from '@/models/user/user.model';
import { injectable } from 'tsyringe';
import { RegisterUserDTO } from '@/dtos/userDTO';
import { AuthProvider, UserDocument, UserRole } from '@/models/user/user.types';
import { AppError } from '@/errors/appError';
import logger from '@/middleware/logger';
//import bcrypt from 'bcryptjs';
import { ErrorCode } from '@/errors/error-code';


// Placeholder for future implementations
@injectable()
export class AuthRepository {

  // e.g., for blacklisted tokens or refresh token storage if needed in future
  async findUserByEmail(email: string): Promise<any> {
    return User.findOne({ email });
  }

  async registerUser(
    userData: RegisterUserDTO // 
  ): Promise<UserDocument> {
    try {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        throw new AppError({
          message: '邮箱已被注册',
          code: ErrorCode.BAD_REQUEST,
        });
      }

      //const hashedPassword = await bcrypt.hash(userData.password!, 10);
      console.log('userData in registerUser:', JSON.stringify(userData, null, 2));

      const newUser = new User({
        ...userData,
        provider: AuthProvider.LOCAL,
        role: UserRole.USER,
      });
      try {
        newUser.providerId = newUser.id.toString() as unknown as string;
        console.log('New user object Id:', newUser.providerId);
        newUser.provider = AuthProvider.LOCAL;
        await newUser.save();//it should be "pre" save event not post.
        console.log('New user:', newUser._id);
        logger.info(`User created: ${newUser._id}`);
        return newUser as unknown as UserDocument;

      } catch (err) {
        if (err instanceof Error) {
          logger.error(`Error creating user: ${userData.email}`, { error: err });
        }
        throw err;
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error creating user: ${userData.email}`, { error: err });
      }
      throw err;
    }
  }
}
