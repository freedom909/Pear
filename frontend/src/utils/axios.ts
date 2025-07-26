// utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // ✅ if you're using cookies (optional)
});

// ✅ Add token automatically if in localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
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

export default axiosInstance;
