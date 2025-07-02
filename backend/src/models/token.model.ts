import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IToken {
  token: string;
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  type: 'refresh' | 'reset' | 'verify';
  isRevoked: boolean;
}

// Document & Model types
export interface TokenDocument extends IToken, Document {}
export interface TokenModel extends Model<TokenDocument> {}

// Schema
const tokenSchema = new Schema<TokenDocument, TokenModel>(
  {
    token: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    type: {
      type: String,
      enum: ['refresh', 'reset', 'verify'],
      default: 'refresh',
    },
    isRevoked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Token = mongoose.model<TokenDocument, TokenModel>(
  'Token',
  tokenSchema
);
