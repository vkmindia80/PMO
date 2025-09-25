import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth headers (if needed in future)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // User management
  createUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  getUsers: async (skip = 0, limit = 50) => {
    const response = await api.get(`/api/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Project management
  createProject: async (projectData, userId) => {
    const response = await api.post(`/api/projects?user_id=${userId}`, projectData);
    return response.data;
  },

  getProjects: async (params = {}) => {
    const { userId, status, projectType, skip = 0, limit = 50 } = params;
    const queryParams = new URLSearchParams();
    
    if (userId) queryParams.append('user_id', userId);
    if (status) queryParams.append('status', status);
    if (projectType) queryParams.append('project_type', projectType);
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/api/projects?${queryParams}`);
    return response.data;
  },

  getProjectById: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
  },

  // Task management
  createTask: async (projectId, taskData) => {
    const response = await api.post(`/api/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  getProjectTasks: async (projectId, status = null) => {
    const url = status 
      ? `/api/projects/${projectId}/tasks?status=${status}`
      : `/api/projects/${projectId}/tasks`;
    const response = await api.get(url);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },

  // File management
  uploadFile: async (projectId, file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await api.post(`/api/projects/${projectId}/upload`, formData, config);
    return response.data;
  },

  // Analytics
  getDashboardAnalytics: async (userId = null) => {
    const url = userId 
      ? `/api/analytics/dashboard?user_id=${userId}`
      : '/api/analytics/dashboard';
    const response = await api.get(url);
    return response.data;
  },

  // Search functionality
  searchProjects: async (query, filters = {}) => {
    const params = { ...filters, search: query };
    return await apiService.getProjects(params);
  },
};

// Utility functions
export const formatApiError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isApiError = (error) => {
  return error.response && error.response.data;
};

// File validation utilities
export const validateFile = (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Add more validation rules as needed
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }
  
  return errors;
};

// Date formatting utilities  
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default api;