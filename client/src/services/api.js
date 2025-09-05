import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
    verify: () => api.get(API_ENDPOINTS.AUTH.VERIFY)
};

// Reports API
export const reportsAPI = {
    create: (reportData) => api.post(API_ENDPOINTS.REPORTS.CREATE, reportData),
    getUserReports: () => api.get(API_ENDPOINTS.REPORTS.GET_USER_REPORTS),
    getAll: () => api.get(API_ENDPOINTS.REPORTS.GET_ALL),
    updateStatus: (reportId, status) => 
        api.patch(`${API_ENDPOINTS.REPORTS.UPDATE_STATUS}/${reportId}/status`, { status })
};

// Admin API
export const adminAPI = {
    login: (credentials) => api.post(API_ENDPOINTS.ADMIN.LOGIN, credentials),
    verify: () => api.get(API_ENDPOINTS.ADMIN.VERIFY)
};

export default api;
