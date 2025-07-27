import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/axios';

// Cache for auth state
let authCache = {
  isAuthenticated: null,
  timestamp: null
};

// Cache duration in milliseconds (5 minutes)
const AUTH_CACHE_DURATION = 5 * 60 * 1000;

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if we have a valid cache
        const now = Date.now();
        if (
          authCache.isAuthenticated !== null &&
          authCache.timestamp &&
          now - authCache.timestamp < AUTH_CACHE_DURATION
        ) {
          setIsAuthenticated(authCache.isAuthenticated);
          setIsLoading(false);
          return;
        }

        // No valid cache, check with server
        const response = await api.get('/api/health');
        const isAuthed = response.status === 200 && response.data?.status === 'ok';

        // Update cache
        authCache = {
          isAuthenticated: isAuthed,
          timestamp: now
        };

        setIsAuthenticated(isAuthed);
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Update cache for failed auth
        authCache = {
          isAuthenticated: false,
          timestamp: Date.now()
        };
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Clear auth cache on logout
export const clearAuthCache = () => {
  authCache = {
    isAuthenticated: null,
    timestamp: null
  };
};

export default PrivateRoute; 