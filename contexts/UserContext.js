import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import apiService from '../utils/api';
import logger, { errorHandler } from '../utils/logger';

// 创建日志记录器
const log = logger.createSubLogger('UserContext');

// 创建上下文
const UserContext = createContext();

/**
 * UserProvider Component
 * 
 * Provides user authentication state and methods to the entire application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} - Context Provider component
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化 - 检查用户是否已登录
  useEffect(() => {
    const checkLoggedIn = async () => {
      log.debug('检查用户登录状态');
      try {
        // 尝试验证令牌并获取当前用户
        const result = await apiService.verifyToken();
        
        if (result.success && result.user) {
          log.debug('用户已登录', { userId: result.user.id });
          setUser(result.user);
        } else {
          log.debug('用户未登录');
          setUser(null);
        }
      } catch (error) {
        log.error('获取用户信息失败', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  /**
   * Login user with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} remember - Whether to remember the user
   * @returns {Object} - Result object with success status and message
   */
  const login = async (email, password, remember = false) => {
    log.debug('尝试登录', { email, remember });
    try {
      const result = await apiService.login(email, password, remember);
      
      if (result.success) {
        log.info('用户登录成功', { userId: result.user.id });
        setUser(result.user);
        return { success: true };
      } else {
        log.warn('用户登录失败', { email, message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      return errorHandler.handleApiError(error, '登录失败，请检查您的凭据');
    }
  };

  /**
   * Register a new user
   * 
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - Result object with success status and message
   */
  const register = async (name, email, password) => {
    log.debug('尝试注册新用户', { email });
    try {
      const result = await apiService.register(name, email, password);
      
      if (result.success) {
        log.info('用户注册成功', { userId: result.user.id });
        setUser(result.user);
        return { success: true };
      } else {
        log.warn('用户注册失败', { email, message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      return errorHandler.handleApiError(error, '注册失败，请稍后重试');
    }
  };

  /**
   * Logout the current user
   * 
   * @returns {Object} - Result object with success status
   */
  const logout = async () => {
    log.debug('尝试登出用户');
    try {
      const result = await apiService.logout();
      
      if (result.success) {
        log.info('用户登出成功');
        setUser(null);
        router.push('/login');
        return { success: true };
      } else {
        log.warn('用户登出失败', { message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      return errorHandler.handleApiError(error, '登出失败，请稍后重试');
    }
  };

  /**
   * Send password reset email
   * 
   * @param {string} email - User email
   * @returns {Object} - Result object with success status and message
   */
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '发送重置链接失败' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || '发送重置链接时发生错误';
      return { success: false, message };
    }
  };

  /**
   * Reset user password with token
   * 
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Object} - Result object with success status and message
   */
  const resetPassword = async (token, password) => {
    try {
      const { data } = await axios.post('/api/auth/reset-password', {
        token,
        password,
      });
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '重置密码失败' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.message || '重置密码时发生错误';
      return { success: false, message };
    }
  };

  /**
   * Update user profile
   * 
   * @param {Object} userData - User data to update
   * @returns {Object} - Result object with success status and message
   */
  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', userData);
      
      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '更新个人资料失败' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || '更新个人资料时发生错误';
      return { success: false, message };
    }
  };

  /**
   * Change user password
   * 
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Result object with success status and message
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '更改密码失败' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || '更改密码时发生错误';
      return { success: false, message };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to use the user context
 * 
 * @returns {Object} - User context value
 */
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}