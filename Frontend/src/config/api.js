// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id) => `/projects/${id}`,
    UPDATE: (id) => `/projects/${id}`,
    DECISION: (id) => `/projects/${id}/decision`,
  },
  HEALTH: '/health',
};

// Request configuration
export const REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

