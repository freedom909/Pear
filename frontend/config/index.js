"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_CONFIG = exports.UI_CONFIG = exports.AUTH_CONFIG = exports.API_CONFIG = void 0;
exports.API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            VERIFY_TOKEN: '/auth/verify-token',
        },
        USER: {
            PROFILE: '/user/profile',
            UPDATE_PROFILE: '/user/profile/update',
            CHANGE_PASSWORD: '/user/password/change',
        },
        TASKS: {
            LIST: '/tasks',
            CREATE: '/tasks/create',
            UPDATE: '/tasks/:id',
            DELETE: '/tasks/:id',
            COMPLETE: '/tasks/:id/complete',
        },
        NOTES: {
            LIST: '/notes',
            CREATE: '/notes/create',
            UPDATE: '/notes/:id',
            DELETE: '/notes/:id',
        },
        REMINDERS: {
            LIST: '/reminders',
            CREATE: '/reminders/create',
            UPDATE: '/reminders/:id',
            DELETE: '/reminders/:id',
        },
    },
    TIMEOUT: 10000,
};
exports.AUTH_CONFIG = {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_info',
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
    PROTECTED_ROUTES: [
        '/dashboard',
        '/profile',
        '/tasks',
        '/notes',
        '/reminders',
    ],
    PUBLIC_ROUTES: [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
    ],
};
exports.UI_CONFIG = {
    COLORS: {
        PRIMARY: '#3B82F6',
        SECONDARY: '#6B7280',
        SUCCESS: '#10B981',
        DANGER: '#EF4444',
        WARNING: '#F59E0B',
        INFO: '#3B82F6',
    },
    BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px',
        '2XL': '1536px',
    },
    ANIMATION: {
        FAST: '150ms',
        NORMAL: '300ms',
        SLOW: '500ms',
    },
    LOADING_TIMEOUT: 30000,
};
exports.SYSTEM_CONFIG = {
    APP_NAME: '梨子',
    APP_DESCRIPTION: '您的个人助手，帮助您管理日常任务和提高生产力',
    VERSION: '1.0.0',
    IS_DEV: process.env.NODE_ENV === 'development',
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
    LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'error',
};
const config = {
    API: exports.API_CONFIG,
    AUTH: exports.AUTH_CONFIG,
    UI: exports.UI_CONFIG,
    SYSTEM: exports.SYSTEM_CONFIG,
};
exports.default = config;
//# sourceMappingURL=index.js.map