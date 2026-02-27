import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const role = userProfile?.role || user?.user_metadata?.role || user?.app_metadata?.role || 'staff';

  const staffNavItems = [
    { label: 'Check-In Hub', path: '/qr-code-scanner', icon: 'QrCode' },
    { label: 'Backup Search', path: '/attendee-search-backup', icon: 'Search' },
  ];

  const adminNavItems = [
    { label: 'Event Overview', path: '/admin-dashboard', icon: 'LayoutDashboard' },
    { label: 'Check-In Hub', path: '/qr-code-scanner', icon: 'QrCode' },
    { label: 'Backup Search', path: '/attendee-search-backup', icon: 'Search' },
    { label: 'Staff Controls', path: '/staff-management', icon: 'Users' },
    { label: 'CSV Import', path: '/csv-import', icon: 'FileUp' },
  ];

  const navItems = role === 'admin' ? adminNavItems : staffNavItems;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/staff-login');
    setSigningOut(false);
  };

  const isActive = (path) => location?.pathname === path;

  const homeRoute = role === 'admin' ? '/admin-dashboard' : '/qr-code-scanner';

  return (
    <>
      <header className="role-nav-header">
        <div className="role-nav-container">
          <div className="role-nav-brand" onClick={() => navigate(homeRoute)} style={{ cursor: 'pointer' }}>
            <div className="role-nav-logo">
              <Icon name="Calendar" size={24} color="#FFFFFF" />
            </div>
            <h1 className="role-nav-title hidden sm:block">Conference Check-In</h1>
            <h1 className="role-nav-title sm:hidden text-base">Check-In</h1>
          </div>

          <nav className="role-nav-tabs">
            {navItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`role-nav-tab ${isActive(item?.path) ? 'active' : ''}`}
                aria-current={isActive(item?.path) ? 'page' : undefined}
              >
                <span className="flex items-center gap-2">
                  <Icon name={item?.icon} size={20} />
                  {item?.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Role badge */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
              role === 'admin' ?'bg-amber-500/20 text-amber-300 border border-amber-500/30' :'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              <Icon name={role === 'admin' ? 'ShieldCheck' : 'UserCheck'} size={12} />
              {role === 'admin' ? 'Admin' : 'Staff'}
            </span>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 transition-colors"
              aria-label="Sign out"
            >
              <Icon name="LogOut" size={16} />
              <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>

            <button
              className="role-nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="role-nav-mobile-menu">
          <div className="role-nav-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <nav className="role-nav-mobile-content">
            {/* Role badge in mobile menu */}
            <div className={`flex items-center gap-2 px-4 py-3 mb-2 rounded-xl text-sm font-medium ${
              role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              <Icon name={role === 'admin' ? 'ShieldCheck' : 'UserCheck'} size={16} />
              <span>{role === 'admin' ? 'Administrator' : 'Staff Member'}</span>
            </div>

            {navItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`role-nav-mobile-item ${isActive(item?.path) ? 'active' : ''}`}
                aria-current={isActive(item?.path) ? 'page' : undefined}
              >
                <span className="flex items-center gap-3">
                  <Icon name={item?.icon} size={24} />
                  {item?.label}
                </span>
              </button>
            ))}

            {/* Mobile sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="role-nav-mobile-item w-full text-left border-t border-white/10 mt-2 pt-2"
            >
              <span className="flex items-center gap-3 text-red-400">
                <Icon name="LogOut" size={24} color="currentColor" />
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default RoleBasedNavigation;