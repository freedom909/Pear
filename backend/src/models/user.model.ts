import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User interface for TypeScript
 */
export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  googleId?: string;
  facebookId?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User schema for MongoDB
 */
const userSchema = new Schema<IUser>(
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
      required: false,
      minlength: 6,
      select: false, // Don't include password in query results by default
    },
    name: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      sparse: true, // Allow null values but ensure uniqueness for non-null values
      unique: true,
    },
    facebookId: {
      type: String,
      sparse: true, // Allow null values but ensure uniqueness for non-null values
      unique: true,
    },
    profilePicture: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

/**
 * Pre-save hook to hash password before saving
 */
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    // Replace plain text password with hashed password
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Method to compare password for login
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    // If user has no password (OAuth only), return false
    if (!this.password) {
      return false;
    }
    
    // Compare candidate password with stored hash
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Create and export User model
 */
export const User = mongoose.model<IUser>('User', userSchema);