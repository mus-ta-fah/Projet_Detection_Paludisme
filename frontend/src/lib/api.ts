// ========================================
// API CLIENT
// ========================================

import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// API FUNCTIONS
// ========================================

export const authApi = {
  // Register
  register: async (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    hospital_name?: string;
    department?: string;
    role: 'admin' | 'doctor' | 'lab_technician' | 'researcher';
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Save token and user
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    await api.post('/auth/logout');
  },

  // Get current user
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const predictionsApi = {
  // Single prediction
  predict: async (file: File, modelId?: string, patientInfo?: {
    patient_id?: string,
    patient_name?: string,
    patient_age?: string,

  }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (modelId) formData.append('model_id', modelId);
    if (patientInfo?.patient_id) formData.append('patient_id', patientInfo.patient_id);
    if (patientInfo?.patient_name) formData.append('patient_name', patientInfo.patient_name);
    if (patientInfo?.patient_age) formData.append('patient_age', patientInfo.patient_age.toString());
    
    const response = await api.post('/predictions/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Batch prediction
  batchPredict: async (files: File[], modelId?: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (modelId) formData.append('model_id', modelId);
    
    const response = await api.post('/predictions/predict/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Compare models
  compareModels: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/predictions/predict/compare', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get history
  getHistory: async (skip = 0, limit = 20) => {
    const response = await api.get('/predictions/history', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get prediction detail
  getDetail: async (predictionId: number) => {
    const response = await api.get(`/predictions/${predictionId}`);
    return response.data;
  },

  // Delete prediction
  delete: async (predictionId: number) => {
    const response = await api.delete(`/predictions/${predictionId}`);
    return response.data;
  },
};

export const statisticsApi = {
  // Get overview
  getOverview: async () => {
    const response = await api.get('/statistics/overview');
    return response.data;
  },

  // Get trends
  getTrends: async (days = 7) => {
    const response = await api.get('/statistics/trends', {
      params: { days },
    });
    return response.data;
  },

  // Get models usage
  getModelsUsage: async () => {
    const response = await api.get('/statistics/models-usage');
    return response.data;
  },
};

export const modelsApi = {
  // List models
  list: async () => {
    const response = await api.get('/models/list');
    return response.data;
  },

  // Get model info
  getInfo: async (modelId: string) => {
    const response = await api.get(`/models/info/${modelId}`);
    return response.data;
  },

  // Get benchmark
  getBenchmark: async () => {
    const response = await api.get('/models/benchmark');
    return response.data;
  },

  // Set default model
  setDefault: async (modelId: string) => {
    const response = await api.post(`/models/set-default/${modelId}`);
    return response.data;
  },
};

export default api;