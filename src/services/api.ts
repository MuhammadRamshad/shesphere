
import axios from 'axios';
import { toast } from 'sonner';

// Create an axios instance with base URL and default configs
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to avoid hanging requests
  timeout: 10000,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You could add auth token here if needed
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

// Add a response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      
      // Show user-friendly error message
      const errorMessage = error.response.data.error || 'An error occurred with your request';
      toast.error(errorMessage);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - redirect to login or refresh token
        localStorage.removeItem('token');
        // In a real app, you might redirect to login page
      } else if (error.response.status === 403) {
        // Forbidden
        toast.error('You do not have permission to perform this action');
      } else if (error.response.status === 404) {
        // Not found
        toast.error('The requested resource was not found');
      } else if (error.response.status === 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
      toast.error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      toast.error('An unexpected error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;
