// models/user/user.model.ts
import mongoose, { Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import {

  UserDocument,
  UserRole,
  UserStatus,
  AuthProvider,
} from './user.types';

const UserSchema = new Schema<UserDocument>(
  {
 email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  match: [
    /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/,
    'Please fill a valid email address',
  ],
},

    password: {
      type: String,
      select: false,
      minlength: 8,
    },
    firstname: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
      required: true,
    },
    providerId: { // how to use 'user._id.toString()'
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.providerId;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Hash password 
UserSchema.methods.hashPassword = async function () {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(this.password, salt);
};

// Update password ChangedAt timestamp
UserSchema.pre<UserDocument>('save', function (next) {
  if (!this.isModified('password') || this.isNew || !this.password) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Method: Compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Generate reset token
UserSchema.methods.getResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  return resetToken;
};

// Method: Clear reset token
UserSchema.methods.clearResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};
// Method: Generate signed JWT token
UserSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'secure-random-string-here', {
    expiresIn: '1h',
  });
};

UserSchema.statics.getUserByResetToken = async function (token: string) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }, // 确保 token 还没过期
  });
}
UserSchema.methods.generateRefreshToken = function (): string { 
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'secure-random-string-here', {
    expiresIn: '7d',
  });
};
// Indexes
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

/**
 * Model
 */
const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;