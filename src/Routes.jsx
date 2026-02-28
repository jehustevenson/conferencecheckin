import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import StaffLogin from './pages/staff-login';
import AttendeeSearchBackup from './pages/attendee-search-backup';
import StaffManagement from './pages/staff-management';
import CsvImport from './pages/csv-import';
import QrCodeScanner from './pages/qr-code-scanner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AttendeeList from './pages/attendee-list';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public route - login page */}
            <Route path="/staff-login" element={<StaffLogin />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/staff-login" replace />} />

            {/* Admin-only routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/csv-import"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CsvImport />
                </ProtectedRoute>
              }
            />

            {/* Staff + Admin routes */}
            <Route
              path="/qr-code-scanner"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <QrCodeScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee-search-backup"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AttendeeSearchBackup />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
            <Route
                path="/attendee-list"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AttendeeList />
    </ProtectedRoute>
  }
/>
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
