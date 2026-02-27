import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const StatusIndicator = ({ connectionStatus = 'connected' }) => {
  const [status, setStatus] = useState(connectionStatus);

  useEffect(() => {
    setStatus(connectionStatus);
  }, [connectionStatus]);

  const isConnected = status === 'connected';

  return (
    <div className="status-indicator">
      <div className={`status-indicator-dot ${isConnected ? 'connected' : 'disconnected'}`} />
      <span className="status-indicator-text">
        {isConnected ? 'System Online' : 'Connection Lost'}
      </span>
      {!isConnected && (
        <Icon name="AlertCircle" size={16} color="var(--color-error)" />
      )}
    </div>
  );
};

export default StatusIndicator;