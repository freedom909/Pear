import bcrypt from 'bcryptjs';
import {  FilterQuery } from 'mongoose';
import {  UserDocument } from '../models/interface/index';
import User from '../models/user/user.model';
import { Log as LoggerConfig } from '../logger/logger';
import { IUserModel } from '../models/interface';


export class UserService {
  static async findUserById(userId: string): Promise<UserDocument | null> {
    return await User.findById(userId);
  }

  static async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email });
  }

  static async findUserByProviderId(provider: string, providerId: string): Promise<UserDocument | null> {
    return await User.findOne({ [`${provider}.id`]: providerId });
  }

  static async findUsers(
    filter: FilterQuery<UserDocument>,
    page = 1,
    limit = 10,
  ): Promise<{ users: UserDocument[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const users = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    return { users, total, page, totalPages };
  }

  static async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const user = new User({ ...userData, password: hashedPassword });
    try {
      await user.save();
    } catch (err) {
      if (err instanceof Error) {
        LoggerConfig.error(`Error creating user: ${userData.email}`, { error: err });
      }
      throw err;
    }
    LoggerConfig.info(`User created: ${user._id}`);
    return user;
  }

  static async updateUser(userId: string, updateData: Partial<UserDocument>): Promise<UserDocument | null> {
    const allowedUpdates = ['name', 'email', 'password', 'avatar'];
    const sanitizedData: any = {};
    for (const key of allowedUpdates) {
      if (updateData[key as keyof UserDocument] !== undefined) {
        sanitizedData[key] = updateData[key as keyof UserDocument];
      }
    }
    if (sanitizedData.password) {
      sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
    }
    const user = await User.findByIdAndUpdate(userId, sanitizedData, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async deleteUser(userId: string): Promise<void> {
    await User.findByIdAndDelete(userId);
    LoggerConfig.info(`User deleted: ${userId}`);
  }

  static async requestPasswordReset(email: string, token: string, expires: Date): Promise<void> {
    const user = await User.findOne({ email }) as IUserModel;
    if (!user) return;
    user.passwordResetToken = token || '';
    user.passwordResetExpires = expires;
    try {
      await user.save();
    } catch (err) {
      if (err instanceof Error) {
        LoggerConfig.error(`Error requesting password reset: ${email}`, { error: err });
      }
      throw err;
    }   
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } }) as IUserModel;
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    LoggerConfig.info(`Password reset for user: ${user.name}`);
  }

  static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } }) as IUserModel;
   const email= user.email;
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    user.verified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    LoggerConfig.info(`email verified for user: ${email}`);
  }

  static async createOAuthUser(provider: string, providerId: string, userData: Partial<UserDocument>): Promise<UserDocument> {
    const existingUser = await User.findOne({ [`${provider}.id`]: providerId });
    if (existingUser) {
      return existingUser;
    }
    const user = new User({ ...userData, [provider]: { id: providerId } });
    await user.save();
    LoggerConfig.info(`OAuth user created: ${user.email}`);
    return user;
  }

  static async linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<UserDocument> {
    const user = await User.findById(userId) as IUserModel & { [key: string]: any };
    if (!user) {
      throw new Error('User not found');
    }
    user[provider] = { id: providerId };
    await user.save();
    LoggerConfig.info(`Linked ${provider} account for user: ${user.email}`);
    return user as unknown as UserDocument;
  }

  static async unlinkOAuthAccount(userId: string, provider: string): Promise<UserDocument> {
    const user = await User.findById(userId) as IUserModel & { [key: string]: any };
    if (!user) {
      throw new Error('User not found');
    }
    user[provider] = undefined;
    await user.save();
    LoggerConfig.info(`Unlinked ${provider} account for user: ${user.email}`);
    // Type assertion to resolve the type assignment issue
    return user as unknown as UserDocument;
  }

  static async findOrCreateUser({ provider, providerId, name, email }: {
    provider: string;
    providerId: string;
    name?: string;
    email?: string;
  }): Promise<UserDocument> {
    let user = await User.findOne({ [`${provider}.id`]: providerId });

    if (!user) {
      if (email) {
        user = await User.findOne({ email });
      }

      if (!user) {
        user = new User({});
        if (email) user.email = email;
        if (name) user.name = name;

        await user.save();
      } else {
        (user as any)[provider + 'Id'] = providerId as string;
        await user.save();
      }
    }

    return user;
  }
 }
