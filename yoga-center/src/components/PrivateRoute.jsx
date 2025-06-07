import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/axios';

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const isAdmin = localStorage.getItem('isAdmin');

      if (!token || isAdmin !== 'true') {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with backend
        await api.get('/api/health', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.clear();
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

export default PrivateRoute; 