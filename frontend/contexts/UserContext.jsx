"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserContext = void 0;
exports.UserProvider = UserProvider;
exports.useUser = useUser;
exports.fetchWithAuth = fetchWithAuth;
const react_1 = require("react");
const router_1 = require("next/router");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importStar(require("../utils/logger"));
const api_1 = __importDefault(require("../utils/api"));
const log = logger_1.default.createSubLogger('UserContext');
exports.UserContext = (0, react_1.createContext)(undefined);
const sanitizeUserData = (userData) => {
    if (!userData) {
        return null;
    }
    const sanitized = { ...userData };
    if (sanitized.email) {
        const [localPart, domain] = sanitized.email.split('@');
        sanitized.email = `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;
    }
    if (sanitized.phone) {
        sanitized.phone = sanitized.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
    }
    if (sanitized.idNumber) {
        sanitized.idNumber = sanitized.idNumber.replace(/^(\d{6})\d{8}(\d{4})$/, '$1********$2');
    }
    const preservedFields = ['token', 'id', 'username', 'role', 'permissions'];
    preservedFields.forEach((field) => {
        if (userData[field]) {
            sanitized[field] = userData[field];
        }
    });
    return sanitized;
};
function UserProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const router = (0, router_1.useRouter)();
    (0, react_1.useEffect)(() => {
        const checkLoggedIn = async () => {
            log.debug('Checking user login status');
            try {
                const result = await api_1.default.verifyToken();
                if (result.success && result.user) {
                    log.debug('User verified', { userId: result.user.id });
                    setUser(result.user);
                    const sanitized = sanitizeUserData(result.user);
                    localStorage.setItem('user', JSON.stringify(sanitized));
                }
                else {
                    log.debug('User not logged in');
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
            catch (error) {
                log.error('Error verifying token:', error);
                setUser(null);
                localStorage.removeItem('user');
            }
            finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);
    const login = async (email, password, remember = false) => {
        log.debug('Attempting login', { email, remember });
        try {
            const result = await api_1.default.login(email, password, remember);
            if (result.success) {
                log.info('Login successful', { userId: result.user.id });
                setUser(result.user);
                const sanitized = sanitizeUserData(result.user);
                localStorage.setItem('user', JSON.stringify(sanitized));
                return { success: true };
            }
            else {
                log.warn('Login failed', { email, message: result.message });
                return { success: false, message: result.message };
            }
        }
        catch (error) {
            return logger_1.errorHandler.handleApiError(error, '登录失败，请检查您的凭据');
        }
    };
    const register = async (name, email, password) => {
        log.debug('Attempting register', { email });
        try {
            const result = await api_1.default.register(name, email, password);
            if (result.success) {
                log.info('Registration successful', { userId: result.user.id });
                setUser(result.user);
                const sanitized = sanitizeUserData(result.user);
                localStorage.setItem('user', JSON.stringify(sanitized));
                return { success: true };
            }
            else {
                log.warn('Registration failed', { email, message: result.message });
                return { success: false, message: result.message };
            }
        }
        catch (error) {
            return logger_1.errorHandler.handleApiError(error, '注册失败，请稍后重试');
        }
    };
    const logout = async () => {
        log.debug('Attempting logout');
        try {
            const result = await api_1.default.logout();
            if (result.success) {
                log.info('Logout successful');
                setUser(null);
                localStorage.removeItem('user');
                router.push('/login');
                return { success: true };
            }
            else {
                log.warn('Logout failed', { message: result.message });
                return { success: false, message: result.message };
            }
        }
        catch (error) {
            return logger_1.errorHandler.handleApiError(error, '登出失败，请稍后重试');
        }
    };
    const forgotPassword = async (email) => {
        try {
            const { data } = await axios_1.default.post('/api/auth/forgot-password', { email });
            if (data.success) {
                return { success: true, message: data.message };
            }
            else {
                return { success: false, message: data.message || '发送重置链接失败' };
            }
        }
        catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || '发送重置链接时发生错误';
            return { success: false, message };
        }
    };
    const resetPassword = async (token, password) => {
        try {
            const { data } = await axios_1.default.post('/api/auth/reset-password', {
                token,
                password,
            });
            if (data.success) {
                return { success: true, message: data.message };
            }
            else {
                return { success: false, message: data.message || '重置密码失败' };
            }
        }
        catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || '重置密码时发生错误';
            return { success: false, message };
        }
    };
    const updateProfile = async (userData) => {
        try {
            const { data } = await axios_1.default.put('/api/auth/profile', userData);
            if (data.success) {
                setUser(data.user);
                const sanitized = sanitizeUserData(data.user);
                localStorage.setItem('user', JSON.stringify(sanitized));
                return { success: true, message: data.message };
            }
            else {
                return { success: false, message: data.message || '更新个人资料失败' };
            }
        }
        catch (error) {
            console.error('Update profile error:', error);
            const message = error.response?.data?.message || '更新个人资料时发生错误';
            return { success: false, message };
        }
    };
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const { data } = await axios_1.default.put('/api/auth/change-password', {
                currentPassword,
                newPassword,
            });
            if (data.success) {
                return { success: true, message: data.message };
            }
            else {
                return { success: false, message: data.message || '更改密码失败' };
            }
        }
        catch (error) {
            console.error('Change password error:', error);
            const message = error.response?.data?.message || '更改密码时发生错误';
            return { success: false, message };
        }
    };
    const isAuthenticated = () => !!user;
    return (<exports.UserContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            forgotPassword,
            resetPassword,
            updateProfile,
            changePassword,
            isAuthenticated,
        }}>
      {children}
    </exports.UserContext.Provider>);
}
function useUser() {
    const context = (0, react_1.useContext)(exports.UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
async function fetchWithAuth(url, options = {}) {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser) {
        throw new Error('No authenticated user');
    }
    const defaultHeaders = {
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
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expired');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}
//# sourceMappingURL=UserContext.jsx.map