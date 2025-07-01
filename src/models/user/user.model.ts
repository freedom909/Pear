// models/user/user.model.ts

import dotenv from 'dotenv'
dotenv.config()
import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {  UserDocument, IUserModel, UserRole, UserStatus } from './user.types';
import { config } from '../config';

const userSchema = new Schema<UserDocument, IUserModel>(
  {
    username: { 
      firstname: { type: String, required: true, trim: true },
      lastname: { type: String, required: true, trim: true },
    } ,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    salt: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    lastLogin: { type: Date },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google', 'facebook', 'twitter', 'apple'], required: true }
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


const jwtSecret = process.env.JWT_SECRET ?? (() => { throw new Error("JWT_SECRET not set"); })();
userSchema.methods.getSignedJwtToken = function (): string {
  // Defensive checks:
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  // Return the signed token
  return jwt.sign(
    { id: this._id },
    jwtSecret,
    { expiresIn:"3d"}// not the reason of 'dotenv', only this way can work.
  );
};



const User = mongoose.model<UserDocument, IUserModel>('User', userSchema);

export default User;
