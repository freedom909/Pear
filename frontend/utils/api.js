import axios from "axios";
import { API_CONFIG, AUTH_CONFIG } from "../config/index.js";
import { User, UserRole } from "../types/user";
class ApiService {
    baseUrl;
    timeout;
    api;
    constructor() {
        this.baseUrl =
            API_CONFIG.BASE_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:3000';
        this.timeout = API_CONFIG.TIMEOUT || 10000;
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
            withCredentials: true,
        });
        this.api.interceptors.request.use((config) => {
            const token = this.getToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        this.api.interceptors.response.use((response) => response, (error) => {
            if (error.response && error.response.status === 401) {
                this.clearToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?session=expired';
                }
            }
            return Promise.reject(error);
        });
    }
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY || 'token');
        }
        return null;
    }
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY || 'token', token);
        }
    }
    clearToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY || 'token');
        }
    }
    get(url, config) {
        return this.api.get(url, config);
    }
    post(url, data, config) {
        return this.api.post(url, data, config);
    }
    put(url, data, config) {
        return this.api.put(url, data, config);
    }
    patch(url, data, config) {
        return this.api.patch(url, data, config);
    }
    delete(url, config) {
        return this.api.delete(url, config);
    }
    async login(email, password, remember = false) {
        try {
            const response = await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password, remember });
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            return {
                success: true,
                user: response.data.user,
                message: response.data.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '登录失败，请检查您的凭据',
            };
        }
    }
    async register(name, email, password) {
        try {
            const response = await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.REGISTER, { name, email, password });
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            return {
                success: true,
                user: response.data.user,
                message: response.data.message,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '注册失败，请稍后重试',
            };
        }
    }
    async forgotPassword(email) {
        try {
            const response = await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            return { success: true, message: response.data.message };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '请求失败，请稍后重试',
            };
        }
    }
    async resetPassword(token, password) {
        try {
            const response = await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
            return { success: true, message: response.data.message };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '密码重置失败，请稍后重试',
            };
        }
    }
    async logout() {
        try {
            await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
            this.clearToken();
            return { success: true, message: '登出成功' };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '登出失败，请稍后重试',
            };
        }
    }
    async verifyToken() {
        try {
            const response = await this.get(index_1.API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
            return { success: true, user: response.data.user };
        }
        catch (error) {
            this.clearToken();
            return {
                success: false,
                message: error.response?.data?.message || '令牌验证失败',
            };
        }
    }

    async refreshToken() {
        try {
            const response = await this.post(index_1.API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN);
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            return {
                success: true,
                user: response.data.user,
                message: response.data.message,
            };
        }
        catch (error) {
            this.clearToken();
            return {
                success: false,
                message: error.response?.data?.message || '令牌刷新失败',
            };
        }
    }
    async getUserProfile() {
        try {
            const response = await this.get(index_1.API_CONFIG.ENDPOINTS.USER.PROFILE);
            return { success: true, user: response.data.user };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '获取用户资料失败',
            };
        }
    }
    async updateUserProfile(profileData) {
        try {
            const response = await this.put(index_1.API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, profileData);
            return {
                success: true,
                user: response.data.user,
                message: response.data.message || '资料更新成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '资料更新失败',
            };
        }
    }
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.put(index_1.API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD, { currentPassword, newPassword });
            return {
                success: true,
                message: response.data.message || '密码修改成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '密码修改失败',
            };
        }
    }
}
const apiService = new ApiService();
export default apiService;
//# sourceMappingURL=api.js.map