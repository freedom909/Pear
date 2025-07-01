//src/config/config.ts
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 环境变量
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pear';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
const logLevel = process.env.LOG_LEVEL || 'info';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// 配置对象
const config = {
  env,
  port,
  
  mongo: {
    uri: mongoUri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: env === 'development',
    },
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: jwtExpiresIn,
  },
  logging: {
    level: logLevel,
  },
  cors: {
    origin: clientUrl,
    credentials: true,
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    senderName: process.env.EMAIL_SENDER_NAME || 'Pear',
  },
  clientUrl: clientUrl,
};

export default config;