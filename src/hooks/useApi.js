import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/axios';

const pendingRequests = new Map();

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  // Generate a unique request ID for this instance
  const getCacheKey = useCallback((url, opts) => {
    return `${url}:${JSON.stringify(opts)}:${requestIdRef.current}`;
  }, []);

  const fetchData = useCallback(async () => {
    // Increment request ID to ensure uniqueness
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    const cacheKey = getCacheKey(endpoint, options);

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      console.log('[useApi] Using pending request:', cacheKey);
      return pendingRequests.get(cacheKey);
    }

    const controller = new AbortController();
    const promise = (async () => {
      try {
        console.log('[useApi] Starting request:', {
          endpoint,
          requestId: currentRequestId
        });

        const response = await api({
          url: endpoint,
          method: 'get',
          signal: controller.signal,
          ...options
        });

        // Only update state if this is the latest request and component is mounted
        if (mountedRef.current && currentRequestId === requestIdRef.current) {
          console.log('[useApi] Request successful:', {
            endpoint,
            requestId: currentRequestId,
            dataLength: Array.isArray(response.data) ? response.data.length : 1
          });
          setData(response.data);
          setError(null);
        }

        return response.data;
      } catch (err) {
        // Ignore aborted requests
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          console.log('[useApi] Request aborted:', {
            endpoint,
            requestId: currentRequestId
          });
          return;
        }

        // Only update error state if this is the latest request and component is mounted
        if (mountedRef.current && currentRequestId === requestIdRef.current) {
          console.error('[useApi] Request failed:', {
            endpoint,
            requestId: currentRequestId,
            error: err.message
          });
          setError(err.message);
        }
        throw err;
      } finally {
        // Only update loading state if this is the latest request and component is mounted
        if (mountedRef.current && currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store the promise and controller
    pendingRequests.set(cacheKey, {
      promise,
      controller
    });

    return promise;
  }, [endpoint, options, getCacheKey]);

  useEffect(() => {
    mountedRef.current = true;

    fetchData().catch(() => {
      // Errors are handled in fetchData
    });

    return () => {
      mountedRef.current = false;
      // Abort any pending requests for this instance
      const cacheKey = getCacheKey(endpoint, options);
      const request = pendingRequests.get(cacheKey);
      if (request?.controller) {
        console.log('[useApi] Cleaning up - aborting request:', cacheKey);
        request.controller.abort();
        pendingRequests.delete(cacheKey);
      }
    };
  }, [endpoint, options, fetchData, getCacheKey]);

  return { data, loading, error, refetch: fetchData };
}; 