import mongoose, { Document, Schema } from 'mongoose';


// 定义令牌接口
export interface IToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  type: string;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 定义令牌模式
const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: [true, '令牌不能为空'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
    },
    userAgent: {
      type: String,
      required: [true, '用户代理不能为空'],
    },
    ipAddress: {
      type: String,
      required: [true, 'IP地址不能为空'],
    },
    expiresAt: {
      type: Date,
      required: [true, '过期时间不能为空'],
      index: { expires: 0 }, // 自动删除过期文档
    },
    type: {
      type: String,
      enum: ['refresh', 'reset', 'verify'],
      default: 'refresh',
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 创建令牌模型
const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;