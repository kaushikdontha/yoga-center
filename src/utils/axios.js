import axios from 'axios';
import { requestQueue } from './requestQueue';

// Create a simple cache for auth checks
const authCheckCache = {
  token: null,
  timestamp: null,
  isValid: false
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Debug flag for development
const DEBUG = import.meta.env.DEV;

// Create base axios instance for internal use
const baseAxios = axios.create(api.defaults);

// Store in-flight requests
const inFlightRequests = new Map();

// Generate cache key from request config
const getCacheKey = (config) => {
  const { method, url, params } = config;
  const key = `${method}:${url}:${JSON.stringify(params)}`;
  console.log('[Axios] Generated cache key:', key);
  return key;
};

// Debug function to log in-flight requests
const logInFlightRequests = () => {
  console.log('[Axios] Current in-flight requests:', {
    count: inFlightRequests.size,
    keys: Array.from(inFlightRequests.keys())
  });
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('[Axios] Request started:', {
      method: config.method,
      url: config.url,
      params: config.params,
      hasSignal: !!config.signal
    });

    // Only handle GET requests
    if (config.method.toLowerCase() !== 'get') {
      console.log('[Axios] Non-GET request, skipping deduplication');
      return config;
    }

    const key = getCacheKey(config);

    // Check if there's already an in-flight request
    if (inFlightRequests.has(key)) {
      console.log('[Axios] Duplicate request detected:', key);
      
      // If request has signal, add abort listener
      if (config.signal) {
        config.signal.addEventListener('abort', () => {
          console.log('[Axios] Request aborted:', key);
          const existingRequest = inFlightRequests.get(key);
          if (existingRequest?.rejectRequest) {
            existingRequest.rejectRequest(new axios.CanceledError('Request aborted'));
          }
          inFlightRequests.delete(key);
          logInFlightRequests();
        });
      }

      return inFlightRequests.get(key);
    }

    console.log('[Axios] New request, creating promise:', key);

    // Create a new promise for this request
    const promise = new Promise((resolve, reject) => {
      // Store the resolve/reject functions
      config.resolveRequest = resolve;
      config.rejectRequest = reject;

      // If request has signal, add abort listener
      if (config.signal) {
        config.signal.addEventListener('abort', () => {
          console.log('[Axios] Request aborted:', key);
          reject(new axios.CanceledError('Request aborted'));
          inFlightRequests.delete(key);
          logInFlightRequests();
        });
      }
    });

    // Store the promise and config
    inFlightRequests.set(key, { promise, config });
    logInFlightRequests();

    return config;
  },
  (error) => {
    console.error('[Axios] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const key = getCacheKey(config);

    console.log('[Axios] Response received:', {
      url: config.url,
      status: response.status,
      hasSignal: !!config.signal
    });

    // Remove from in-flight requests after a short delay
    setTimeout(() => {
      console.log('[Axios] Cleaning up request:', key);
      inFlightRequests.delete(key);
      logInFlightRequests();
    }, 100);

    // If this was a cached request, resolve it
    if (config.resolveRequest) {
      console.log('[Axios] Resolving cached request:', key);
      config.resolveRequest(response);
    }

    return response;
  },
  (error) => {
    // Don't log aborted requests as errors
    if (axios.isCancel(error)) {
      console.log('[Axios] Request cancelled:', error.message);
      return Promise.reject(error);
    }

    console.error('[Axios] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    const config = error.config;
    if (config) {
      const key = getCacheKey(config);
      
      console.log('[Axios] Cleaning up failed request:', key);
      inFlightRequests.delete(key);
      logInFlightRequests();

      // If this was a cached request, reject it
      if (config.rejectRequest) {
        console.log('[Axios] Rejecting cached request:', key);
        config.rejectRequest(error);
      }
    }

    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[Axios] Adding auth token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Axios] Auth interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[Axios] Auth error, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Override the request method
api.request = async function(config) {
  try {
    // Remove Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request
    if (DEBUG) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data instanceof FormData ? 'FormData' : config.data,
        headers: config.headers,
        queueSize: requestQueue.size
      });
    }

    // Queue the request
    const response = await requestQueue.enqueue(config, baseAxios);

    // Log response
    if (DEBUG) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        queueSize: requestQueue.size
      });
    }

    return response;
  } catch (error) {
    // Handle errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw {
        response: {
          data: {
            success: false,
            error: 'Network Error',
            message: 'Unable to connect to the server. Please check your internet connection.'
          }
        }
      };
    }

    // Handle CORS errors
    if (error.response.status === 0 || (error.response.status === 403 && error.response.headers['access-control-allow-origin'] === null)) {
      console.error('CORS error:', error);
      throw {
        response: {
          data: {
            error: 'CORS Error',
            message: 'The server is not accessible due to CORS restrictions.'
          }
        }
      };
    }

    // Log error
    if (DEBUG) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        queueSize: requestQueue.size
      });
    }

    // Ensure consistent error format
    if (error.response && (!error.response.data || typeof error.response.data !== 'object')) {
      error.response.data = {
        success: false,
        error: 'Request failed',
        message: error.message || 'An unexpected error occurred'
      };
    }

    throw error;
  }
};

// Override convenience methods to use the queue
['get', 'delete', 'head', 'options'].forEach(method => {
  api[method] = function(url, config = {}) {
    return this.request({
      ...config,
      method,
      url
    });
  };
});

['post', 'put', 'patch'].forEach(method => {
  api[method] = function(url, data, config = {}) {
    return this.request({
      ...config,
      method,
      url,
      data
    });
  };
});

// Add helper method for auth checks
api.checkAuth = async () => {
  const token = localStorage.getItem('token');
  
  // If no token, not authenticated
  if (!token) {
    return false;
  }

  // Check cache first
  if (
    authCheckCache.token === token &&
    authCheckCache.isValid &&
    Date.now() - authCheckCache.timestamp < CACHE_DURATION
  ) {
    return true;
  }

  try {
    await api.get('/api/health');
    return true;
  } catch (error) {
    return false;
  }
};

export default api; 