import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const OperationalToolbar = ({ isVisible = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tools = [
    { label: 'QR Scanner', path: '/qr-code-scanner', icon: 'QrCode' },
    { label: 'Manual Search', path: '/attendee-search-backup', icon: 'Search' },
  ];

  const handleToolSwitch = (path) => {
    navigate(path);
  };

  const isActive = (path) => location?.pathname === path;

  if (!isVisible) return null;

  return (
    <div className="operational-toolbar">
      <div className="operational-toolbar-container">
        {tools?.map((tool) => (
          <button
            key={tool?.path}
            onClick={() => handleToolSwitch(tool?.path)}
            className={`operational-toolbar-toggle ${isActive(tool?.path) ? 'active' : ''}`}
            aria-current={isActive(tool?.path) ? 'page' : undefined}
          >
            <Icon name={tool?.icon} size={20} />
            <span>{tool?.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OperationalToolbar;