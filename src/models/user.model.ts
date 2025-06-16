import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
export interface UserDocument extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  googleId?: string;
  facebookId?: string;
  twitterId?: string;
  appleId?: string;
  photo?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
  generatePasswordResetToken(): Promise<string>;
  generateEmailVerificationToken(): Promise<string>;
}

/**
 * User model type
 */
export type UserModel = mongoose.Model<UserDocument>;

/**
 * User schema
 */
const userSchema = new Schema<UserDocument>({
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
  verificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  facebookId: {
    type: String,
    sparse: true,
    unique: true
  },
  twitterId: {
    type: String,
    sparse: true,
    unique: true
  },
  appleId: {
    type: String,
    sparse: true,
    unique: true
  },
  photo: {
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
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });
userSchema.index({ twitterId: 1 }, { sparse: true });
userSchema.index({ appleId: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
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
    console.error('Error comparing password:', error);
    return false;
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
    console.error('Error adding refresh token:', error);
    throw new Error(`Failed to add refresh token: ${error instanceof Error ? error.message : String(error)}`);
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
    const initialLength = user.refreshTokens.length;
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    
    // Only save if token was actually removed
    if (user.refreshTokens.length !== initialLength) {
      await user.save();
    }
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw new Error(`Failed to remove refresh token: ${error instanceof Error ? error.message : String(error)}`);
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
    
    // Only save if there were tokens to clear
    if (user.refreshTokens.length > 0) {
      user.refreshTokens = [];
      await user.save();
    }
  } catch (error) {
    console.error('Error clearing refresh tokens:', error);
    throw new Error(`Failed to clear refresh tokens: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate password reset token method
 */
userSchema.methods.generatePasswordResetToken = async function(): Promise<string> {
  try {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to passwordResetToken field
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expiration (1 hour)
    this.passwordResetExpires = new Date(Date.now() + 3600000);
    
    await this.save();
    return resetToken;
  } catch (error) {
    console.error('Error generating password reset token:', error);
    throw new Error(`Failed to generate password reset token: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate email verification token method
 */
userSchema.methods.generateEmailVerificationToken = async function(): Promise<string> {
  try {
    // Generate random token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
      
    // Set expiration (24 hours)
    this.emailVerificationExpires = new Date(Date.now() + 86400000);
    
    await this.save();
    return verificationToken;
  } catch (error) {
    console.error('Error generating email verification token:', error);
    throw new Error(`Failed to generate email verification token: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Create and export model
 const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

// Export default
export default User;