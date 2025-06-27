// models/user/user.model.ts
import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import {  UserDocument, IUserModel, UserRole, UserStatus } from './user.types';
import { config } from '../config';

const userSchema = new Schema<UserDocument, IUserModel>(
  {
    username: { type: String, required: true, trim: true } ,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    salt: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    lastLogin: { type: Date },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.salt;
        return ret;
      },
    },
  }
);

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hash = crypto
    .pbkdf2Sync(
      password,
      this.salt,
      config.security.password.iterations,
      config.security.password.keylen,
      config.security.password.digest
    )
    .toString('hex');

  return this.passwordHash === hash;
};
// Instance method to verify password
userSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
  const hash = crypto
    .pbkdf2Sync(
      password,
      this.salt,
      config.security.password.iterations,
      config.security.password.keylen,
      config.security.password.digest
    )
    .toString('hex');

  return this.passwordHash === hash;
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

const User = mongoose.model<UserDocument, IUserModel>('User', userSchema);

export default User;
