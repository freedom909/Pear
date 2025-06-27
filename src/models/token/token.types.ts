// models/token/token.types.ts
import mongoose from 'mongoose';

export interface IToken {
  token: string;
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  type: "refresh" | "reset" | "verify";
  isRevoked: boolean;
}
