import { Request, Response, NextFunction } from 'express';
import { hasConnectedGoogle } from '../config/google.passport';

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // 保存用户尝试访问的 URL，以便登录后重定向
  if (req.method === 'GET') {
    req.session.returnTo = req.originalUrl;
  }
  
  req.flash('errors', ['请先登录。']);
  res.redirect('/auth/login');
};

/**
 * 检查用户是否有权访问 Google Photos
 * 用户必须已连接 Google 账号并具有有效的访问令牌
 */
export const canAccessGooglePhotos = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    req.flash('errors', ['请先登录。']);
    return res.redirect('/auth/login');
  }

  if (!hasConnectedGoogle(req.user)) {
    req.flash('errors', ['请先连接您的 Google 账号。']);
    return res.redirect('/account');
  }

  next();
};

/**
 * 检查用户的 Google 访问令牌是否有效
 */
export const requireValidGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.google?.accessToken) {
    req.flash('errors', ['请先连接您的 Google 账号。']);
    return res.redirect('/account');
  }

  try {
    // 这里可以添加令牌验证逻辑
    // 例如，调用 Google API 验证令牌是否有效
    // 如果令牌无效，可以尝试使用刷新令牌获取新的访问令牌
    next();
  } catch (error) {
    console.error('Google 访问令牌验证失败:', error);
    req.flash('errors', ['Google 账号访问失败，请重新连接您的账号。']);
    return res.redirect('/account');
  }
};

/**
 * API 错误处理中间件
 */
export const handleApiError = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  
  // 如果响应已经发送，传递给下一个错误处理程序
  if (res.headersSent) {
    return next(err);
  }
  
  // 处理特定类型的错误
  if (err.response?.status === 401) {
    return res.status(401).json({
      success: false,
      error: '身份验证失败，请重新登录。'
    });
  }
  
  if (err.response?.status === 403) {
    return res.status(403).json({
      success: false,
      error: '您没有权限执行此操作。'
    });
  }
  
  // 默认错误响应
  res.status(500).json({
    success: false,
    error: '服务器内部错误，请稍后再试。'
  });
};

/**
 * 处理未捕获的异常
 */
export const handleUncaughtException = (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
};