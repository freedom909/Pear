/**
 * Application Configuration
 */

// API配置接口
export interface ApiEndpoints {
  [key: string]: string;
}

export interface ApiEndpointGroups {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    LOGOUT: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
    VERIFY_TOKEN: string;
    REFRESH_TOKEN: string;
  };
  USER: {
    PROFILE: string;
    UPDATE_PROFILE: string;
    CHANGE_PASSWORD: string;
  };
  TASKS: {
    LIST: string;
    CREATE: string;
    UPDATE: string;
    DELETE: string;
    COMPLETE: string;
  };
  NOTES: {
    LIST: string;
    CREATE: string;
    UPDATE: string;
    DELETE: string;
  };
  REMINDERS: {
    LIST: string;
    CREATE: string;
    UPDATE: string;
    DELETE: string;
  };
  [key: string]: ApiEndpoints;
}

export interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: ApiEndpointGroups;
  TIMEOUT: number;
}

// 认证配置接口
export interface AuthConfig {
  TOKEN_KEY: string;
  USER_KEY: string;
  TOKEN_EXPIRY: number;
  PROTECTED_ROUTES: string[];
  PUBLIC_ROUTES: string[];
}

// UI配置接口
export interface UiColors {
  PRIMARY: string;
  SECONDARY: string;
  SUCCESS: string;
  DANGER: string;
  WARNING: string;
  INFO: string;
  [key: string]: string;
}

export interface UiBreakpoints {
  SM: string;
  MD: string;
  LG: string;
  XL: string;
  '2XL': string;
  [key: string]: string;
}

export interface UiAnimation {
  FAST: string;
  NORMAL: string;
  SLOW: string;
  [key: string]: string;
}

export interface UiConfig {
  COLORS: UiColors;
  BREAKPOINTS: UiBreakpoints;
  ANIMATION: UiAnimation;
  LOADING_TIMEOUT: number;
}

// 系统配置接口
export interface SystemConfig {
  APP_NAME: string;
  APP_DESCRIPTION: string;
  VERSION: string;
  IS_DEV: boolean;
  DEBUG: boolean;
  LOG_LEVEL: string;
}

// 全局配置接口
export interface AppConfig {
  API: ApiConfig;
  AUTH: AuthConfig;
  UI: UiConfig;
  SYSTEM: SystemConfig;
}

// API配置
export const API_CONFIG: ApiConfig = {
  // API基础URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // API端点
  ENDPOINTS: {
    // 认证相关
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_TOKEN: '/auth/verify-token',
      REFRESH_TOKEN: '/auth/refresh-token',
    },

    // 用户相关
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile/update',
      CHANGE_PASSWORD: '/user/password/change',
    },

    // 任务相关
    TASKS: {
      LIST: '/tasks',
      CREATE: '/tasks/create',
      UPDATE: '/tasks/:id',
      DELETE: '/tasks/:id',
      COMPLETE: '/tasks/:id/complete',
    },

    // 笔记相关
    NOTES: {
      LIST: '/notes',
      CREATE: '/notes/create',
      UPDATE: '/notes/:id',
      DELETE: '/notes/:id',
    },

    // 提醒相关
    REMINDERS: {
      LIST: '/reminders',
      CREATE: '/reminders/create',
      UPDATE: '/reminders/:id',
      DELETE: '/reminders/:id',
    },
  },

  // API请求超时时间（毫秒）
  TIMEOUT: 10000,
};

// 认证配置
export const AUTH_CONFIG: AuthConfig = {
  // Token存储键名
  TOKEN_KEY: 'token',

  // 用户信息存储键名
  USER_KEY: 'user_info',

  // Token过期时间（毫秒）
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24小时

  // 需要认证的路由
  PROTECTED_ROUTES: [
    '/dashboard',
    '/profile',
    '/tasks',
    '/notes',
    '/reminders',
  ],

  // 公开路由
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};

// UI配置
export const UI_CONFIG: UiConfig = {
  // 主题色
  COLORS: {
    PRIMARY: '#3B82F6', // blue-500
    SECONDARY: '#6B7280', // gray-500
    SUCCESS: '#10B981', // green-500
    DANGER: '#EF4444', // red-500
    WARNING: '#F59E0B', // yellow-500
    INFO: '#3B82F6', // blue-500
  },

  // 断点
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },

  // 动画持续时间
  ANIMATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },

  // 加载状态超时
  LOADING_TIMEOUT: 30000, // 30秒
};

// 系统配置
export const SYSTEM_CONFIG: SystemConfig = {
  // 应用名称
  APP_NAME: '梨子',

  // 应用描述
  APP_DESCRIPTION: '您的个人助手，帮助您管理日常任务和提高生产力',

  // 版本号
  VERSION: '1.0.0',

  // 开发环境标识
  IS_DEV: process.env.NODE_ENV === 'development',

  // 调试模式
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',

  // 日志级别
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'error',
};

// 导出默认配置
const config: AppConfig = {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  UI: UI_CONFIG,
  SYSTEM: SYSTEM_CONFIG,
};

export default config;