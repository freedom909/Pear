import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User roles enum
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * User document interface
 */
export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  googleId?: string;
  avatar?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

/**
 * User schema
 */
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE
  },
  verified: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String
  },
  refreshTokens: [{
    type: String,
    select: false // Don't include refresh tokens in queries by default
  }]
}, {
  timestamps: true
});

/**
 * User schema indexes
 */
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Load password field
    const user = await this.model('User').findById(this._id).select('+password');
    
    if (!user?.password) {
      return false;
    }
    
    // Compare passwords
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Add refresh token method
 */
userSchema.methods.addRefreshToken = async function(token: string): Promise<void> {
  try {
    // Load refresh tokens
    const user = await this.model('User')
      .findById(this._id)
      .select('+refreshTokens');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Add token if not exists
    if (!user.refreshTokens.includes(token)) {
      user.refreshTokens.push(token);
      await user.save();
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Remove refresh token method
 */
userSchema.methods.removeRefreshToken = async function(token: string): Promise<void> {
  try {
    // Load refresh tokens
    const user = await this.model('User')
      .findById(this._id)
      .select('+refreshTokens');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove token
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    await user.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Clear all refresh tokens method
 */
userSchema.methods.clearRefreshTokens = async function(): Promise<void> {
  try {
    // Load refresh tokens
    const user = await this.model('User')
      .findById(this._id)
      .select('+refreshTokens');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Clear tokens
    user.refreshTokens = [];
    await user.save();
  } catch (error) {
    throw error;
  }
};

// Create and export model
export const User = mongoose.model<IUser>('User', userSchema);