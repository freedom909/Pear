// models/user/user.model.ts

import dotenv from 'dotenv';
dotenv.config();
import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserDocument} from './user.types';
import { config } from '../config';

const userSchema = new Schema<UserDocument>(
  {
    // other fields...
  linkedAccounts: {
  type: [
    {
      provider: {
        type: String,
        enum: ['google', 'facebook', 'twitter', 'apple'],
        required: true,
      },
      providerId: { type: String, required: true },
      email: { type: String },
      linkedAt: { type: Date, default: Date.now },
    }
  ],
  default: [],
},

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


// Method to set password
userSchema.methods.setPassword = function (password: string): void {
  // Generate a random salt
  this.salt = crypto.randomBytes(16).toString('hex');
  // Hash the password with the salt
  this.passwordHash = crypto
    .pbkdf2Sync(
      password,
      this.salt,
      config.security.password.iterations,
      config.security.password.keylen,
      config.security.password.digest
    )
    .toString('hex');
};

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
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
userSchema.methods.verifyPassword = async function (
  password: string
): Promise<boolean> {
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

const jwtSecret =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET not set');
  })();
userSchema.methods.getSignedJwtToken = function (): string {
  // Defensive checks:

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  // Return the signed token
  return jwt.sign(
    { id: this._id },
    jwtSecret,
    { expiresIn: '3d' } // not the reason of 'dotenv', only this way can work.
  );
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;