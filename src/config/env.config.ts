import { cleanEnv, str, port, bool, num } from 'envalid';

/**
 * Environment Configuration
 * Validates and provides type-safe access to environment variables
 */
export const validateEnv = () => {
  return cleanEnv(process.env, {
    // Server
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port({ default: 3000 }),
    API_URL: str(),
    CLIENT_URL: str(),
    
    // Database
    MONGODB_URI: str(),
    
    // JWT
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    JWT_ACCESS_EXPIRES: str({ default: '15m' }),
    JWT_REFRESH_EXPIRES: str({ default: '7d' }),
    
    // Email (SMTP)
    SMTP_HOST: str(),
    SMTP_PORT: port({ default: 587 }),
    SMTP_SECURE: bool({ default: false }),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    SMTP_FROM: str({ default: 'noreply@example.com' }),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: num({ default: 15 }), // minutes
    RATE_LIMIT_MAX: num({ default: 100 }), // requests per window
    
    // OAuth (Optional)
    GOOGLE_CLIENT_ID: str({ default: '' }),
    GOOGLE_CLIENT_SECRET: str({ default: '' }),
    FACEBOOK_APP_ID: str({ default: '' }),
    FACEBOOK_APP_SECRET: str({ default: '' }),
    TWITTER_CONSUMER_KEY: str({ default: '' }),
    TWITTER_CONSUMER_SECRET: str({ default: '' }),
    
    // File Upload (Optional)
    UPLOAD_MAX_SIZE: num({ default: 5242880 }), // 5MB in bytes
    UPLOAD_ALLOWED_TYPES: str({ default: 'image/jpeg,image/png,image/gif' }),
    
    // Security
    CORS_ORIGIN: str({ default: '*' }),
    CORS_METHODS: str({ default: 'GET,POST,PUT,DELETE,PATCH' }),
    CORS_CREDENTIALS: bool({ default: true }),
    
    // Cache (Optional)
    REDIS_URI: str({ default: '' }),
    CACHE_TTL: num({ default: 3600 }), // seconds
    
    // Logging
    LOG_LEVEL: str({ 
      choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
      default: 'info'
    }),
    LOG_FORMAT: str({ 
      choices: ['combined', 'common', 'dev', 'short', 'tiny'],
      default: 'dev'
    }),
  });
};

/**
 * Example .env file content
 */
export const envExample = `
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
CLIENT_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/your_database

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@example.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret

# File Upload (Optional)
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# Security
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_CREDENTIALS=true

# Cache (Optional)
REDIS_URI=redis://localhost:6379
CACHE_TTL=3600

# Logging
LOG_LEVEL=info
LOG_FORMAT=dev
`;

// Create a .env.example file with example configuration
if (process.env.NODE_ENV === 'development') {
  const fs = require('fs');
  const path = require('path');
  
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExample.trim());
    console.log('.env.example file created successfully');
  }
}