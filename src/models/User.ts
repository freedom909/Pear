import mongoose, { Document, Schema } from 'mongoose';
import { PasswordUtil } from '../utils/password.util';

/**
 * User roles enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User status enum
 */
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

/**
 * User authentication provider enum
 */
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
}

/**
 * User document interface
 */
export interface UserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerId?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  website?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  fullName: string;
}

/**
 * User schema
 */
const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        return this.provider === AuthProvider.LOCAL;
      },
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    providerId: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    tokenVersion: {
      type: Number,
      default: 0,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

/**
 * Virtual for user's full name
 */
userSchema.virtual('fullName').get(function(this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save hook to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password
    this.password = await PasswordUtil.hash(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Methods
 */
userSchema.methods = {
  /**
   * Compare password
   * @param candidatePassword Plain text password
   */
  comparePassword: async function(candidatePassword: string): Promise<boolean> {
    return PasswordUtil.compare(candidatePassword, this.password);
  },
  
  /**
   * Generate email verification token
   */
  generateEmailVerificationToken: function(): string {
    this.emailVerificationToken = PasswordUtil.generateToken();
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return this.emailVerificationToken;
  },
  
  /**
   * Generate password reset token
   */
  generatePasswordResetToken: function(): string {
    this.passwordResetToken = PasswordUtil.generateToken();
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return this.passwordResetToken;
  },
  
  /**
   * Increment token version
   */
  incrementTokenVersion: function(): number {
    this.tokenVersion += 1;
    return this.tokenVersion;
  },
};

/**
 * Statics
 */
userSchema.statics = {
  /**
   * Find user by email
   * @param email User email
   */
  findByEmail: function(email: string) {
    return this.findOne({ email });
  },
  
  /**
   * Find user by email verification token
   * @param token Email verification token
   */
  findByEmailVerificationToken: function(token: string) {
    return this.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
  },
  
  /**
   * Find user by password reset token
   * @param token Password reset token
   */
  findByPasswordResetToken: function(token: string) {
    return this.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
  },
};

// Create and export User model
export const User = mongoose.model<UserDocument>('User', userSchema);