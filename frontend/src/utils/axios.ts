// utils/axios.ts
import axios from 'axios';


const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // ✅ This ensures cookies (like auth_token) are sent
});

// ✅ Add token automatically if in localStorage
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
(res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout or redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
