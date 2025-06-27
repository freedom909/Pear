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
import errorHandler   from './middleware/errorHandler';
import notFound from './middleware/notFoundHandler';
import logger,{  logStream } from './middleware/logger';
import { initRedis } from './middleware/redis';
import userRoutes from './routes/userAndAuth.routes';
import authRoutes from './routes/auth.routes';
import { PassportConfig } from './config/passport.config';

import { connectDB } from './config/database';
import passport from 'passport';
import session from 'express-session';

// 初始化Express应用
const app = express();

// 配置session中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 初始化Passport
app.use(passport.initialize());
app.use(passport.session());

// 初始化OAuth策略 - 只使用一种初始化方式
PassportConfig.initialize();

// 初始化Express应用
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
  logger.info('Express app initialized');
});

// 连接数据库
connectDB();

// 初始化Redis
initRedis();

// 信任代理
app.set('trust proxy', true);

// 安全中间件
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(hpp());

// 请求解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 压缩响应
app.use(compression());

// 日志中间件
app.use(
  morgan('combined', {
    stream: logStream,
    skip: (req) => req.url === '/health'
  })
);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 全局速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// 健康检查端点
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Google OAuth已在上方初始化，此处无需重复

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
// app.use('/api', googleRoutes);

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  logger.error(`未捕获的异常: ${err.message}`);
  process.exit(1);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (err: Error) => {
  logger.error(`未处理的拒绝: ${err.message}`);
  process.exit(1);
});

export default app;