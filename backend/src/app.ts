import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import session from 'express-session';
import passport from 'passport';

import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFoundHandler';
import logger, { logStream } from './middleware/logger';
import { initRedis } from './middleware/redis';
import { connectDB } from './config/database';
import { setupSessionSerialization } from './strategies/session'; // ✅ your helper function
import { AuthStrategyFactory } from './strategies/auth.factory';
import userService from './services/user.service';
import apiRoutes from './routes/index';

import { OAuthConfiguration } from './config/oauth';
const oauthConfigs = OAuthConfiguration.getConfigs();
// Initialize DB
connectDB();

// Initialize Redis
initRedis();

// ✅ Initialize Passport session serialization
setupSessionSerialization();

// ✅ Initialize OAuth strategies
const factory = new AuthStrategyFactory(passport, oauthConfigs, userService);
factory.initializeStrategies();

// Initialize Express app
const app = express();

// Trust proxy (for e.g., Heroku or Nginx)
app.set('trust proxy', false);

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(mongoSanitize());
app.use(hpp());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Populate res.locals.user for views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Logging
app.use(
  morgan('combined', {
    stream: logStream,
    skip: (req) => req.url === '/health',
  })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve frontend public images
const frontendImagesPath = path.join(__dirname, '../../../../Pear/frontend/public/images');
console.log('Frontend images path:', frontendImagesPath);

// Serve .png files directly
app.use('/images', express.static(frontendImagesPath));

// Redirect .jpg requests to .png for backward compatibility
app.get('/images/avatar.jpg', (_req, res) => {
  res.redirect('/images/avatar.png');
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '请求过于频繁，请稍后再试',
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', apiRoutes);

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error(`❌ 未捕获的异常: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err: Error) => {
  logger.error(`❌ 未处理的拒绝: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// App initialized log
logger.info('✅ Express app initialized');

export default app;