import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../../config/config';
import logger  from '../../utils/logger';
import { UserDocument } from '../interface/index';

// 用户接口


// 用户Schema
const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: {
      type: String,
      unique: true,
      sparse: true, // 允许多个null值
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // OAuth相关字段
    googleId: { type: String, unique: true, sparse: true },
    googleAccessToken: String,
    googleRefreshToken: String,
    profilePhoto: String,
    emailVerified: {
      type: Boolean,
      default: false
    },
    name: { // 用于存储OAuth提供的显示名称
      type: String,
      trim: true
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// 密码加密中间件
userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);//
    next();
  } catch (error) {
    logger.error('密码加密错误:', error);
    next(error as Error);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};



userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { sub: this._id, role: this.role },
    config.jwt.secret as string, // ensure the secret is a string
    {
      expiresIn: config.jwt.expiresIn || '1d',
    } as SignOptions
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { sub: this._id },
    config.jwt.secret as string, // ensure the secret is a string
    { expiresIn: '30d' }
  );
};

// 用户模型
const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

export default User;