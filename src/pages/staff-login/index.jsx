import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SecurityBadge from './components/SecurityBadge';
import BrandingHeader from './components/BrandingHeader';
import CredentialsInfo from './components/CredentialsInfo';
import { useAuth } from '../../contexts/AuthContext';

const StaffLogin = () => {
  const { user, userProfile, loading } = useAuth();

  // If already logged in, redirect to appropriate home
  if (!loading && user) {
    const role = userProfile?.role || user?.user_metadata?.role || user?.app_metadata?.role || 'staff';
    return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/qr-code-scanner'} replace />;
  }

  return (
    <>
      <Helmet>
        <title>Staff Login - Conference Check-In</title>
        <meta name="description" content="Secure authentication portal for conference check-in staff and administrators" />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg space-y-6 md:space-y-8">
          <BrandingHeader />

          <div className="bg-card border border-border rounded-xl md:rounded-2xl shadow-elevation-2 p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
            <div className="space-y-2 md:space-y-3">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
                Welcome Back
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Sign in to access the check-in management system
              </p>
            </div>

            <LoginForm />

            <SecurityBadge />
          </div>


          <div className="text-center space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground">
              Conference Check-In System v2.0
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              &copy; {new Date()?.getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffLogin;