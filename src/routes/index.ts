import express from 'express';

import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = express.Router();

// API版本前缀
const API_PREFIX = '/api/v1';

// 注册路由

router.use(`${API_PREFIX}/user`, userRoutes); // 注册用户路由
router.use(`${API_PREFIX}/auth`, authRoutes); // 注册认证路由


// 根路由 - API健康检查
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'bear API服务运行正常',
    apiVersion: 'v1',
    environment: process.env.NODE_ENV,
  });
});

export default router;