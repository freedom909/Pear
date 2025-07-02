const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../utils/config');

// 验证用户是否已登录
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头或cookie中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // 从请求头中获取token
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 从cookie中获取token
      token = req.cookies.token;
    }

    // 检查token是否存在
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录以获取访问权限'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '此token对应的用户不存在'
      });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '未授权，请重新登录',
      error: error.message
    });
  }
};

// 限制特定角色的访问
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }
    next();
  };
};