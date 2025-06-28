import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Check if this is not a login request
      if (!error.config.url.includes('/api/auth/login')) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        
        // Only redirect if we're in the browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Auth endpoints
  auth: {
    login: (email, password) => {
      return api.post('/api/auth/login', { email, password });
    },
    register: (userData) => {
      return api.post('/api/auth/register', userData);
    },
    forgotPassword: (email) => {
      return api.post('/api/auth/forgot-password', { email });
    },
    resetPassword: (token, password) => {
      return api.post('/api/auth/reset-password', { token, password });
    },
    getCurrentUser: () => {
      return api.get('/api/auth/me');
    },
    logout: () => {
      localStorage.removeItem('token');
      // You could also hit a logout endpoint if needed
      // return api.post('/api/auth/logout');
    },
  },
  
  // User endpoints
  users: {
    getProfile: () => {
      return api.get('/api/users/profile');
    },
    updateProfile: (userData) => {
      return api.put('/api/users/profile', userData);
    },
    changePassword: (currentPassword, newPassword) => {
      return api.put('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
    },
  },
  
  // Generic request methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default apiService;
export { api }; // Export the axios instance for direct use if needed