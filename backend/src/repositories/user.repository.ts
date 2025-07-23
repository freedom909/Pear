import 'reflect-metadata'; // ← これをファイルの一番上に追加

import { injectable } from 'tsyringe';
import UserModel from '../models/user/user.model';
import { UserDocument } from '../models/user/user.types';

@injectable()
export class UserRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findOne(query: Partial<UserDocument>): Promise<UserDocument | null> {
    return UserModel.findOne(query as any);
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return UserModel.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+password');
  }

  async findByProvider(provider: string, providerId: string): Promise<UserDocument | null> {
    return UserModel.findOne({ provider, providerId });
  }

  async createUser(data: Partial<UserDocument>): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async updateUser(userId: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, data, { new: true });
  }

  async linkProvider(
    userId: string,
    provider: string,
    providerId: string,
    displayName: string,
    avatarUrl: string
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, {
      provider,
      providerId,
      username: displayName,
      avatar: avatarUrl,
    }, { new: true });
  }

  async getUserByResetToken(token: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      passwordResetToken: token,
      resetPasswordExpiresIn: { $gt: new Date() }
    });
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({email});
  }
}
