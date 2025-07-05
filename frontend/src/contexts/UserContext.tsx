import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  JSX,
} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import logger, { errorHandler } from '../utils/logger';
import apiService from '../utils/api';

const log = logger.createSubLogger('UserContext');

import { UserRole } from '../types/user';

// User interface
export interface User {
  id: string;
  name?: string;
  username?: {
    firstname: string;
    lastname: string;
  };
  email?: string;
  phone?: string;
  idNumber?: string;
  token?: string;
  refreshToken?: string;
  tokenExpiry?: number; // Unix timestamp
  role?: UserRole;
  permissions?: string[];
  avatar?: string;
  provider?: string;
  isVerified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// API response interfaces
interface ApiResponse {
  success: boolean;
  message?: string;
}

// interface UserApiResponse extends ApiResponse {
//   user?: User;
// }

// Context value interface
export interface UserContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<ApiResponse>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<ApiResponse>;
  
  logout: () => Promise<ApiResponse>;
  forgotPassword: (email: string) => Promise<ApiResponse>;
  resetPassword: (token: string, password: string) => Promise<ApiResponse>;
  updateProfile: (userData: Partial<User>) => Promise<ApiResponse>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<ApiResponse>;
  isAuthenticated: () => boolean;
  refreshToken: () => Promise<boolean>;
}

// Create context with default undefined value
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Props for UserProvider
interface UserProviderProps {
  children: ReactNode;
}

/**
 * Sanitize sensitive user fields before storing in localStorage
 */
const sanitizeUserData = (userData: User | null): User | null => {
  if (!userData) {
    return null;
  }

  const sanitized = { ...userData };

  // Mask email
  if (sanitized.email) {
    const [localPart, domain] = sanitized.email.split('@');
    sanitized.email = `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;
  }

  // Mask phone
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(
      /^(\d{3})\d{4}(\d{4})$/,
      '$1****$2'
    );
  }

  // Mask ID number
  if (sanitized.idNumber) {
    sanitized.idNumber = sanitized.idNumber.replace(
      /^(\d{6})\d{8}(\d{4})$/,
      '$1********$2'
    );
  }

  // Keep essential auth fields
  const preservedFields = ['token', 'id', 'username', 'role', 'permissions', 'avatar', 'name'];
  preservedFields.forEach((field) => {
    if (userData[field]) {
      sanitized[field] = userData[field];
    }
  });

  return sanitized;
};

/**
 * UserProvider
 */
export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const result = await apiService.refreshToken();
      if (result.success && result.user) {
        setUser(result.user);
        const sanitized = sanitizeUserData(result.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(sanitized));
        }
        return true;
      }
      return false;
    } catch (error) {
      log.error('Token refresh failed:', error);
      return false;
    }
  };

  // On mount: try to validate token with backend
  useEffect(() => {
    const checkLoggedIn = async (): Promise<void> => {
      log.debug('Checking user login status');
      try {
        const result = await apiService.verifyToken();

        if (result.success && result.user) {
          log.debug('User verified', { userId: result.user.id });
          setUser(result.user);
          // Also persist sanitized copy to localStorage
          const sanitized = sanitizeUserData(result.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(sanitized));
          }

          // Set up token refresh before expiration
          if (result.user.tokenExpiry) {
            const expiresIn = result.user.tokenExpiry * 1000 - Date.now();
            const refreshTime = Math.max(expiresIn - 300000, 0); // Refresh 5 minutes before expiry
            setTimeout(refreshToken, refreshTime);
          }
        } else {
          log.debug('User not logged in');
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        log.error('Error verifying token:', error);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (
    email: string,
    password: string,
    remember = false
  ): Promise<ApiResponse> => {
    log.debug('Attempting login', { email, remember });
    try {
      const result = await apiService.login(email, password, remember);

      if (result.success) {
        log.info('Login successful', { userId: result.user.id });
        setUser(result.user);
                  const sanitized = sanitizeUserData(result.user);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(sanitized));
                  }
        return { success: true };
      } else {
        log.warn('Login failed', { email, message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      return errorHandler.handleApiError(error, '登录失败，请检查您的凭据');
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    log.debug('Attempting register', { email });
    try {
      const result = await apiService.register(name, email, password);

      if (result.success) {
        log.info('Registration successful', { userId: result.user.id });
        try {
          await setUser(result.user);
          const sanitized = sanitizeUserData(result.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(sanitized));
          }
          log.debug('State updated, attempting navigation to dashboard');
          await router.push('/dashboard');
          log.debug('Navigation to dashboard completed');
          return { success: true };
        } catch (error) {
          log.error('Registration flow error:', error);
          return { 
            success: false, 
            message: 'Registration completed but encountered an error' 
          };
        }
      } else {
        log.warn('Registration failed', { email, message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      log.error('Registration API error:', error);
      
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        
        if (status === 400) {
          return { 
            success: false, 
            message: data?.message || '请求参数错误，请检查填写内容' 
          };
        } else if (status === 409) {
          return { 
            success: false, 
            message: data?.message || '该邮箱已被注册' 
          };
        } else if (status === 422) {
          return { 
            success: false, 
            message: data?.message || '输入验证失败，请检查填写内容' 
          };
        } else if (status >= 500) {
          return { 
            success: false, 
            message: '服务器错误，请稍后重试' 
          };
        }
      }
      
      return { 
        success: false, 
        message: '注册失败，请稍后重试' 
      };
    }
  };

  const logout = async (): Promise<ApiResponse> => {
    log.debug('Attempting logout');
    try {
      const result = await apiService.logout();

      if (result.success) {
        log.info('Logout successful');
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        router.push('/login');
        return { success: true };
      } else {
        log.warn('Logout failed', { message: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      return errorHandler.handleApiError(error, '登出失败，请稍后重试');
    }
  };

  const forgotPassword = async (email: string): Promise<ApiResponse> => {
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '发送重置链接失败' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message =
        (error as any).response?.data?.message || '发送重置链接时发生错误';
      return { success: false, message };
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<ApiResponse> => {
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
      const message =
        (error as any).response?.data?.message || '重置密码时发生错误';
      return { success: false, message };
    }
  };

  const updateProfile = async (
    userData: Partial<User>
  ): Promise<ApiResponse> => {
    try {
      const { data } = await axios.put('/api/auth/profile', userData);
      if (data.success) {
        setUser(data.user);
        const sanitized = sanitizeUserData(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(sanitized));
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '更新个人资料失败' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const message =
        (error as any).response?.data?.message || '更新个人资料时发生错误';
      return { success: false, message };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
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
      const message =
        (error as any).response?.data?.message || '更改密码时发生错误';
      return { success: false, message };
    }
  };

  const isAuthenticated = (): boolean => !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        initialized: !loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        isAuthenticated,
        refreshToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to access user context
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

/**
 * Helper for authenticated fetch requests
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  if (!storedUser) {
    throw new Error('No authenticated user');
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${storedUser.token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Session expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}