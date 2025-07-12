import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TWITTER = 'twitter'
}

export interface IUser extends Document {
  email: string;
  password?: string;
  username: {
    firstname: string;
    lastname: string;
  };
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  provider: AuthProvider;
  providerId?: string;
  roles: string[];
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  getResetPasswordToken: () => string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}
export type UserDocument = IUser & Document;
const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    select: false,
    minlength: 8
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  provider: {
    type: String,
    enum: Object.values(AuthProvider),
    required: true,
    default: AuthProvider.LOCAL
  },
  providerId: {
    type: String,
    select: false
  },
  roles: {
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.USER]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.providerId;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update passwordChangedAt when password is modified
UserSchema.pre<IUser>('save', function(next) {
  if (!this.isModified('password') || this.isNew || !this.password) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

UserSchema.pre<IUser>('save', function(next) {
  if (!this.isModified('password') || this.isNew || !this.password) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
  });

  UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = bcrypt.hashSync(crypto.randomUUID() + crypto.randomUUID(), 10);
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
  };
  
// Method to compare passwords
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;