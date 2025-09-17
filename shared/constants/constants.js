// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
  },
  REPORTS: {
    CREATE: '/api/reports',
    GET_USER_REPORTS: '/api/reports/mine',
    GET_ALL: '/api/admin/reports',
    UPDATE_STATUS: '/api/admin/reports',
  },
  ADMIN: {
    LOGIN: '/api/admin/login',
    VERIFY: '/api/admin/verify',
  },
};

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in progress',
  RESOLVED: 'resolved',
};

// Report Severity
export const REPORT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  ADMIN_TOKEN: 'adminToken',
  USER: 'user',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SUBMIT_REPORT: '/dashboard/submit',
  MY_REPORTS: '/dashboard/my-reports',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
};
