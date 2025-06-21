import mongoose, { Schema } from 'mongoose';

import { UserDocument, IUserModel, UserStatus, UserRole } from '../interface/index';

const UserSchema = new Schema<UserDocument, IUserModel>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },

    verified: { type: Boolean, default: false },
    verificationToken: String,

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    googleId: String,
    facebookId: String,
    twitterId: String,
    appleId: String,

    photo: String,
    refreshTokens: [{ type: String }],

  },
  { timestamps: true }
);

export default mongoose.model<UserDocument, IUserModel>('User', UserSchema);