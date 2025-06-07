import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  // Ensure cookies and credentials are sent
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // Increase timeout for slower connections
  timeout: 10000
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData requests, remove Content-Type header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data instanceof FormData ? 'FormData' : config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }

    // Validate response structure for non-GET requests
    if (response.config.method !== 'get' && response.data) {
      // Check if response has the expected structure
      if (typeof response.data !== 'object') {
        return Promise.reject({
          response: {
            status: response.status,
            data: {
              success: false,
              error: 'Invalid response format',
              message: 'Server response is not in the expected format'
            }
          }
        });
      }

      // For auth endpoints, ensure proper response structure
      if (response.config.url.includes('/auth/')) {
        if (!response.data.success || !response.data.data) {
          return Promise.reject({
            response: {
              status: response.status,
              data: {
                success: false,
                error: 'Invalid response structure',
                message: response.data.message || 'Server response is missing required data'
              }
            }
          });
        }
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            error: 'Network Error',
            message: 'Unable to connect to the server. Please check your internet connection.'
          }
        }
      });
    }

    // Handle CORS errors
    if (error.response.status === 0 || (error.response.status === 403 && error.response.headers['access-control-allow-origin'] === null)) {
      console.error('CORS error:', error);
      return Promise.reject({
        response: {
          data: {
            error: 'CORS Error',
            message: 'The server is not accessible due to CORS restrictions. Please check the server configuration.'
          }
        }
      });
    }

    // Handle 401 errors
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If not a login request, clear auth and redirect
      if (!originalRequest.url.includes('/auth/login')) {
        console.log('Authentication failed, redirecting to login');
        localStorage.clear();
        window.location.href = '/admin/login';
      }
      
      return Promise.reject(error);
    }

    // Log detailed error information in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    // Ensure consistent error response structure
    if (error.response && (!error.response.data || typeof error.response.data !== 'object')) {
      error.response.data = {
        success: false,
        error: 'Request failed',
        message: error.message || 'An unexpected error occurred'
      };
    }

    // Ensure error response has required fields
    if (error.response && error.response.data) {
      if (!error.response.data.success) {
        error.response.data.success = false;
      }
      if (!error.response.data.error) {
        error.response.data.error = error.response.data.message || 'Request failed';
      }
      if (!error.response.data.message) {
        error.response.data.message = error.response.data.error || 'An unexpected error occurred';
      }
    }

    return Promise.reject(error);
  }
);

export default api;