import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LiveUpdateIndicator = ({ lastUpdate }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(timer);
  }, [lastUpdate]);

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-success/10 rounded-xl">
      <div className={`w-2 h-2 rounded-full bg-success ${pulse ? 'animate-ping' : ''}`} />
      <Icon name="RefreshCw" size={16} color="var(--color-success)" />
      <span className="text-xs md:text-sm font-medium text-success">
        Live • Updated {formatTime(lastUpdate)}
      </span>
    </div>
  );
};

export default LiveUpdateIndicator;