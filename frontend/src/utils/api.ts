import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config';

// API response interfaces
export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface UserResponse extends ApiResponse {
  user?: any;
  token?: string;
}

/**
 * API Service Class
 *
 * Provides unified interface for API requests.
 */
class ApiService {
  private baseUrl: string;
  private timeout: number;
  private api: AxiosInstance;

  constructor() {
    this.baseUrl =
      API_CONFIG.BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",  

    this.timeout = API_CONFIG.TIMEOUT || 10000;

    // Create Axios instance
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
      withCredentials: true,
    });

    // Request interceptor to attach token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login?session=expired';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token helpers
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY || 'token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY || 'token', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY || 'token');
    }
  }

  // Generic request methods
  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Auth methods
  async login(
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<UserResponse> {
    try {
      const response = await this.post<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password, remember }
      );
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败，请检查您的凭据',
      };
    }
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<UserResponse> {
    try {
      const response = await this.api.post<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
       
        { name, email, password }
      );
      console.log('API_CONFIG.ENDPOINTS.AUTH.REGISTER')
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败，请稍后重试',
      };
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await this.post<ApiResponse>(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '请求失败，请稍后重试',
      };
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.post<ApiResponse>(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password }
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '密码重置失败，请稍后重试',
      };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.post<ApiResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      this.clearToken();
      return { success: true, message: '登出成功' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '登出失败，请稍后重试',
      };
    }
  }

  async verifyToken(): Promise<UserResponse> {
    try {
      const response = await this.get<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN
      );
      return { success: true, user: response.data.user };
    } catch (error: any) {
      this.clearToken();
      return {
        success: false,
        message: error.response?.data?.message || '令牌验证失败',
      };
    }
  }

  async refreshToken(): Promise<UserResponse> {
    try {
      const response = await this.post<UserResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN
      );
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error: any) {
      this.clearToken();
      return {
        success: false,
        message: error.response?.data?.message || '令牌刷新失败',
      };
    }
  }

  // User profile
  async getUserProfile(): Promise<UserResponse> {
    try {
      const response = await this.get<UserResponse>(
        API_CONFIG.ENDPOINTS.USER.PROFILE
      );
      return { success: true, user: response.data.user };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '获取用户资料失败',
      };
    }
  }

  async updateUserProfile(
    profileData: Record<string, any>
  ): Promise<UserResponse> {
    try {
      const response = await this.put<UserResponse>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        profileData
      );
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || '资料更新成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '资料更新失败',
      };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    try {
      const response = await this.put<ApiResponse>(
        API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD,
        { currentPassword, newPassword }
      );
      return {
        success: true,
        message: response.data.message || '密码修改成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '密码修改失败',
      };
    }
  }
}

// Export singleton
const apiService = new ApiService();
export default apiService;