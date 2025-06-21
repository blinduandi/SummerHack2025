import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Backdrop } from '@mui/material';
import { HashLoader } from 'react-spinners';
import { useAuth } from '../../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute]', {
    requireAuth,
    isAuthenticated,
    isInitialized,
    isLoading,
    path: location.pathname
  });

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <Backdrop
        sx={{
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
        }}
        open={true}
      >
        <HashLoader color="#6366f1" loading={true} size={50} />
      </Backdrop>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to login - auth required but not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required (login/register pages) and user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to dashboard - user already authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
