// Request cache with Map to store promises
const requestCache = new Map();

// Cache duration in milliseconds (30 seconds)
const CACHE_DURATION = 30 * 1000;

// Clean expired cache entries
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
};

// Clean cache periodically
setInterval(cleanCache, CACHE_DURATION);

// Generate cache key from request config
const getCacheKey = (config) => {
  const { url, method, params = {}, data } = config;
  // Sort params to ensure consistent key generation
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  
  return `${method}:${url}:${JSON.stringify(sortedParams)}:${JSON.stringify(data)}`;
};

// Request manager
export const requestManager = {
  // Get cached promise or create new one
  getRequest: (config) => {
    const cacheKey = getCacheKey(config);
    const cached = requestCache.get(cacheKey);

    // Return cached promise if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.promise.then(response => ({...response}));
    }

    // Delete expired cache
    if (cached) {
      requestCache.delete(cacheKey);
    }

    return null;
  },

  // Cache a new request promise
  setRequest: (config, promise) => {
    const cacheKey = getCacheKey(config);
    const wrappedPromise = promise.then(response => {
      // Clone the response to prevent mutations
      return {...response};
    }).catch(error => {
      // Remove failed requests from cache
      requestManager.clearRequest(config);
      throw error;
    });

    requestCache.set(cacheKey, {
      promise: wrappedPromise,
      timestamp: Date.now()
    });

    return wrappedPromise;
  },

  // Clear specific request from cache
  clearRequest: (config) => {
    const cacheKey = getCacheKey(config);
    requestCache.delete(cacheKey);
  },

  // Clear all requests from cache
  clearAll: () => {
    requestCache.clear();
  },

  // Get cache size for debugging
  getCacheSize: () => {
    return requestCache.size;
  }
}; 