import { API_CONFIG, AUTH_CONFIG } from '../config';

/**
 * API工具类
 * 
 * 提供统一的接口来处理所有的API请求
 */
class ApiService {
  /**
   * 构造函数
   */
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.endpoints = API_CONFIG.ENDPOINTS;
  }

  /**
   * 获取存储的认证令牌
   * 
   * @returns {string|null} 认证令牌
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    }
    return null;
  }

  /**
   * 设置认证令牌
   * 
   * @param {string} token - 认证令牌
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    }
  }

  /**
   * 清除认证令牌
   */
  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    }
  }

  /**
   * 构建请求URL
   * 
   * @param {string} endpoint - API端点
   * @param {Object} params - URL参数
   * @returns {string} 完整的请求URL
   */
  buildUrl(endpoint, params = {}) {
    let url = `${this.baseUrl}${endpoint}`;
    
    // 替换URL中的参数占位符
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
  }

  /**
   * 构建请求头
   * 
   * @param {Object} customHeaders - 自定义请求头
   * @returns {Object} 请求头对象
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 处理API响应
   * 
   * @param {Response} response - Fetch API响应对象
   * @returns {Promise<Object>} 处理后的响应数据
   * @throws {Error} 如果响应状态码不是2xx
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      // 处理认证错误
      if (response.status === 401) {
        this.clearToken();
        // 如果在浏览器环境中，重定向到登录页面
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      // 抛出错误
      const error = new Error(data.message || 'API请求失败');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * 发送API请求
   * 
   * @param {string} method - HTTP方法
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @param {Object} options.params - URL参数
   * @param {Object} options.data - 请求体数据
   * @param {Object} options.headers - 自定义请求头
   * @returns {Promise<Object>} 响应数据
   */
  async request(method, endpoint, { params = {}, data = null, headers = {} } = {}) {
    const url = this.buildUrl(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);

    const config = {
      method,
      headers: requestHeaders,
      credentials: 'include', // 包含跨域请求的cookies
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      // 添加请求超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), this.timeout);
      });

      const fetchPromise = fetch(url, config);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  /**
   * 发送GET请求
   * 
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * 发送POST请求
   * 
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求体数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  post(endpoint, data = {}, options = {}) {
    return this.request('POST', endpoint, { ...options, data });
  }

  /**
   * 发送PUT请求
   * 
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求体数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  put(endpoint, data = {}, options = {}) {
    return this.request('PUT', endpoint, { ...options, data });
  }

  /**
   * 发送PATCH请求
   * 
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求体数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  patch(endpoint, data = {}, options = {}) {
    return this.request('PATCH', endpoint, { ...options, data });
  }

  /**
   * 发送DELETE请求
   * 
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * 用户登录
   * 
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @param {boolean} remember - 是否记住用户
   * @returns {Promise<Object>} 登录结果
   */
  async login(email, password, remember = false) {
    try {
      const response = await this.post(this.endpoints.AUTH.LOGIN, {
        email,
        password,
        remember,
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return {
        success: true,
        user: response.user,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '登录失败，请检查您的凭据',
      };
    }
  }

  /**
   * 用户注册
   * 
   * @param {string} name - 用户姓名
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<Object>} 注册结果
   */
  async register(name, email, password) {
    try {
      const response = await this.post(this.endpoints.AUTH.REGISTER, {
        name,
        email,
        password,
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return {
        success: true,
        user: response.user,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '注册失败，请稍后重试',
      };
    }
  }

  /**
   * 用户登出
   * 
   * @returns {Promise<Object>} 登出结果
   */
  async logout() {
    try {
      await this.post(this.endpoints.AUTH.LOGOUT);
      this.clearToken();
      
      return {
        success: true,
        message: '登出成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '登出失败，请稍后重试',
      };
    }
  }

  /**
   * 忘记密码
   * 
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object>} 请求结果
   */
  async forgotPassword(email) {
    try {
      const response = await this.post(this.endpoints.AUTH.FORGOT_PASSWORD, {
        email,
      });

      return {
        success: true,
        message: response.message || '重置密码链接已发送到您的邮箱',
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '请求失败，请稍后重试',
      };
    }
  }

  /**
   * 重置密码
   * 
   * @param {string} token - 重置令牌
   * @param {string} password - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(token, password) {
    try {
      const response = await this.post(this.endpoints.AUTH.RESET_PASSWORD, {
        token,
        password,
      });

      return {
        success: true,
        message: response.message || '密码重置成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '密码重置失败，请稍后重试',
      };
    }
  }

  /**
   * 验证令牌
   * 
   * @returns {Promise<Object>} 验证结果
   */
  async verifyToken() {
    try {
      const response = await this.get(this.endpoints.AUTH.VERIFY_TOKEN);

      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      this.clearToken();
      
      return {
        success: false,
        message: error.data?.message || '令牌验证失败',
      };
    }
  }

  /**
   * 获取用户资料
   * 
   * @returns {Promise<Object>} 用户资料
   */
  async getUserProfile() {
    try {
      const response = await this.get(this.endpoints.USER.PROFILE);

      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '获取用户资料失败',
      };
    }
  }

  /**
   * 更新用户资料
   * 
   * @param {Object} profileData - 用户资料数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserProfile(profileData) {
    try {
      const response = await this.put(this.endpoints.USER.UPDATE_PROFILE, profileData);

      return {
        success: true,
        user: response.user,
        message: response.message || '个人资料更新成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '更新个人资料失败',
      };
    }
  }

  /**
   * 修改密码
   * 
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.put(this.endpoints.USER.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      return {
        success: true,
        message: response.message || '密码修改成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.data?.message || '密码修改失败',
      };
    }
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;