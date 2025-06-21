import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import  UserSchema from './schema';
import { IUserModel, UserDocument } from '../interface/index';
import { Schema } from 'mongoose';

/**
 * Hash password before saving
 */

UserSchema.pre('save', async function (this: any, next: Function) { // Property 'pre' does not exist on type 'IUserModel'
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

async function comparePassword(this: UserDocument & { password: string }, candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
}

    async function generateEmailVerificationToken (this: UserDocument): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        this.emailVerificationToken = token;
        this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await this.save();
        return token;
      };
  
  async function generatePasswordResetToken (this: UserDocument): Promise<string>{
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Fixed type error
    return token;
  };

  async function generateRefreshToken (this: UserDocument): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    this.refreshTokens.push(token);
    return token;
  };

  async function addRefreshToken(this: UserDocument, token: string) {

    this.refreshTokens.push(token);
  };

  async function generateAccessToken(this: UserDocument): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  };

  async function changePassword(this: UserDocument, newPassword: string) {

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    this.createdAt = new Date(Date.now());
    await this.save();
  };

  /**
  📚 Static Methods
  */
  async function findByEmail (this: IUserModel,email: string) {
    return await this.findOne({ email });
  };

  async function findByVerificationToken (this: IUserModel,token: string) {
    return await this.findOne({ verificationToken: token });
  };

 async function findByPasswordResetToken  (this: IUserModel,token: string) {
    return await this.findOne({ passwordResetToken: token });
  };

  async function findByRefreshToken  (this: IUserModel,token: string) {
    return await this.findOne({ refreshTokens: token });
  };

  async function isEmailTaken (this: IUserModel,email: string, excludeUserId?: string) {
    if (excludeUserId) {
      const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
      return !!user;
    }
    const user = await this.findOne({ email });
    return !!user;
  };

  async function isPasswordResetTokenValid (this: IUserModel,token: string) {
    const user = await this.findOne({ passwordResetToken: token });
    return !!user && user.passwordResetExpires && user.passwordResetExpires > new Date(Date.now());
  };

  async function isRefreshTokenValid (this: IUserModel,  token: string) {
    const user = await this.findOne({ refreshTokens: token });
    // Since refreshTokensExpires is not in UserDocument, adjust the logic
    if (user && user.refreshTokensExpires) {//Property 'refreshTokensExpires' does not exist on type 'Document<unknown, {}, UserDocument, {}> & UserDocument & Required<{ _id: unknown; }> & { __v: number; }'.
      return user.refreshTokensExpires > new Date(Date.now());
    }
 
    return false;
  };

export default mongoose.model<UserDocument>('User', new Schema());