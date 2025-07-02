const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/userModel');
const config = require('../utils/config');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d'
  });
};

// 设置cookie选项
const cookieOptions = {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 生成令牌
    const token = generateToken(user._id);

    // 设置cookie
    res.cookie('token', token, cookieOptions);

    // 返回用户信息（不包含密码）
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 检查用户是否提供了邮箱和密码
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    // 查找用户并获取密码
    const user = await User.findOne({ email }).select('+password');

    // 检查用户是否存在以及密码是否正确
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }

    // 生成令牌
    const token = generateToken(user._id);

    // 设置cookie
    res.cookie('token', token, cookieOptions);

    // 返回用户信息（不包含密码）
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

// 用户登出
exports.logout = (req, res) => {
  // 清除cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10秒后过期
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: '成功登出'
  });
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

// GitHub OAuth认证
exports.githubAuth = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${config.github.callbackUrl}&scope=user:email`;
  res.redirect(githubAuthUrl);
};

// GitHub OAuth回调
exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // 获取访问令牌
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });

    const githubUser = userResponse.data;

    // 获取用户邮箱
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });

    const emails = emailResponse.data;
    const primaryEmail = emails.find(email => email.primary) || emails[0];

    // 查找或创建用户
    let user = await User.findOne({ githubId: githubUser.id });

    if (!user) {
      // 检查是否有使用相同邮箱的用户
      user = await User.findOne({ email: primaryEmail.email });

      if (user) {
        // 更新现有用户的GitHub ID
        user.githubId = githubUser.id;
        if (!user.avatar) {
          user.avatar = githubUser.avatar_url;
        }
        await user.save();
      } else {
        // 创建新用户
        user = await User.create({
          username: githubUser.login,
          email: primaryEmail.email,
          githubId: githubUser.id,
          avatar: githubUser.avatar_url,
          isVerified: primaryEmail.verified
        });
      }
    }

    // 生成令牌
    const token = generateToken(user._id);

    // 设置cookie
    res.cookie('token', token, cookieOptions);

    // 重定向到前端
    res.redirect(`${config.frontendUrl}/oauth/social-success?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.redirect(`${config.frontendUrl}/login?error=github_auth_failed`);
  }
};