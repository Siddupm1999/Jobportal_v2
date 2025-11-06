import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredUserType && user.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard if user type doesn't match
    const dashboardPath = user.user_type === 'employer' 
      ? '/employer/dashboard' 
      : '/jobseeker/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;