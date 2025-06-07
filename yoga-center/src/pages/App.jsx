import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");
  const isAuthenticated = token && isAdmin === "true";
  
  console.log('PrivateRoute authentication check:', {
    token: token ? "present" : "missing",
    isAdmin,
    isAdminCheck: isAdmin === "true",
    isAuthenticated,
    localStorage: {
      token: !!localStorage.getItem("token"),
      isAdmin: localStorage.getItem("isAdmin"),
      user: localStorage.getItem("user")
    }
  });

  if (!isAuthenticated) {
    console.log('Authentication failed, redirecting to login');
    return <Navigate to="/admin-login" replace />;
  }

  console.log('Authentication successful, rendering protected route');
  return children;
}

export default PrivateRoute; 