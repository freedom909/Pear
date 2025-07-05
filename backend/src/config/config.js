"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//src/config/config.ts
require('dotenv').config();

// Test output to verify config is working
console.log('Environment variables loaded:');
console.log({
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET ? '*****' : undefined,
  NODE_ENV: process.env.NODE_ENV
});
// 环境变量
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 5000;
var mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pear';
var jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
var jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
var jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
var jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
var logLevel = process.env.LOG_LEVEL || 'info';
var clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
// 配置对象
var config = {
    env: env,
    port: port,
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
        refreshSecret: jwtRefreshSecret,
        refreshExpiresIn: jwtRefreshExpiresIn,
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
exports.default = config;