import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Guards routes based on auth state and user role
 * @param {React.ReactNode} children - The component to render if access is granted
 * @param {string[]} allowedRoles - Roles permitted to access this route (empty = any authenticated user)
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Wait for auth + profile to resolve
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/staff-login" state={{ from: location }} replace />;
  }

  // Role check (if specific roles required)
  if (allowedRoles?.length > 0) {
    const role = userProfile?.role || user?.user_metadata?.role || user?.app_metadata?.role || 'staff';
    if (!allowedRoles?.includes(role)) {
      // Staff trying to access admin-only page → redirect to their home
      return <Navigate to="/qr-code-scanner" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
