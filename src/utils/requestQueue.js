// Request queue implementation
class RequestQueue {
  constructor() {
    this.queue = new Map();
    this.inProgress = new Map();
  }

  // Generate unique key for request
  getKey(config) {
    const { url, method, params = {}, data } = config;
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${method}:${url}:${JSON.stringify(sortedParams)}:${JSON.stringify(data)}`;
  }

  // Add request to queue
  async enqueue(config, axiosInstance) {
    const key = this.getKey(config);

    // If request is in progress, wait for it
    if (this.inProgress.has(key)) {
      console.log(`Request in progress: ${config.method} ${config.url}`);
      return this.inProgress.get(key);
    }

    // Create new promise for this request
    const promise = new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          // Add to in-progress
          this.inProgress.set(key, promise);

          // Execute request
          const response = await axiosInstance(config);

          // Remove from in-progress
          this.inProgress.delete(key);

          // Resolve with response
          resolve(response);
        } catch (error) {
          // Remove from in-progress on error
          this.inProgress.delete(key);
          reject(error);
        }
      };

      // Execute immediately for GET requests
      if (config.method.toLowerCase() === 'get') {
        execute();
      } else {
        // For non-GET requests, wait for queue to be empty
        const checkQueue = () => {
          if (this.inProgress.size === 0) {
            execute();
          } else {
            setTimeout(checkQueue, 50);
          }
        };
        checkQueue();
      }
    });

    return promise;
  }

  // Clear all queues
  clear() {
    this.queue.clear();
    this.inProgress.clear();
  }

  // Get queue size
  get size() {
    return {
      queue: this.queue.size,
      inProgress: this.inProgress.size
    };
  }
}

// Create singleton instance
export const requestQueue = new RequestQueue(); 