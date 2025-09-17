/**
 * Types
 * 
 * Type definitions and constants for better code organization
 */

// User types
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Report status types
export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

// Report severity types
export const REPORT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Report category types
export const REPORT_CATEGORY = {
  ROAD_HAZARD: 'road_hazard',
  UTILITY_ISSUE: 'utility_issue',
  ENVIRONMENTAL: 'environmental',
  SAFETY: 'safety',
  OTHER: 'other',
};

// Notification types
export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
  },
  REPORTS: {
    GET_ALL: '/api/reports',
    CREATE: '/api/reports',
    GET_BY_ID: (id) => `/api/reports/${id}`,
    UPDATE: (id) => `/api/reports/${id}`,
    DELETE: (id) => `/api/reports/${id}`,
  },
  ADMIN: {
    LOGIN: '/api/admin/login',
    VERIFY: '/api/admin/verify',
    REPORTS: '/api/admin/reports',
    UPDATE_STATUS: (id) => `/api/admin/reports/${id}/status`,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'cypress_token',
  USER: 'cypress_user',
  ADMIN_TOKEN: 'cypress_admin_token',
  ADMIN_USER: 'cypress_admin_user',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  DASHBOARD: '/dashboard',
  MY_REPORTS: '/my-reports',
  SUBMIT_REPORT: '/submit-report',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
};
