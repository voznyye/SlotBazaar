import axios from 'axios';
import { toast } from 'react-toastify';

// Create API instance with base URL
const API = axios.create({
  baseURL: '/api',  // Always use /api prefix as we're using nginx proxy
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Network request failed');
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    switch (status) {
      case 400:
        toast.error(error.response?.data?.detail || 'Invalid request');
        break;
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 429:
        toast.error('Too many requests. Please try again later');
        break;
      case 500:
        toast.error('Server error. Please try again later');
        break;
      default:
        toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default API;
