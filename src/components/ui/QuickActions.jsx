import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const QuickActions = ({ userName = 'Staff Member', userRole = 'staff' }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/staff-login');
  };

  return (
    <div className="quick-actions" ref={dropdownRef}>
      <button
        className="quick-actions-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="User menu"
        aria-expanded={dropdownOpen}
      >
        <Icon name="User" size={24} />
      </button>

      {dropdownOpen && (
        <div className="quick-actions-dropdown">
          <div className="quick-actions-user-info">
            <div className="quick-actions-user-name">{userName}</div>
            <div className="quick-actions-user-role">
              {userRole === 'admin' ? 'Administrator' : 'Check-In Staff'}
            </div>
          </div>
          <button
            className="quick-actions-menu-item danger"
            onClick={handleLogout}
          >
            <Icon name="LogOut" size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickActions;