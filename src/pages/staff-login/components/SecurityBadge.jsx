import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadge = () => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-success/10 border border-success/20 rounded-lg md:rounded-xl">
      <Icon name="Shield" size={20} color="var(--color-success)" />
      <span className="text-xs md:text-sm font-medium text-success">
        SSL Secured Connection
      </span>
    </div>
  );
};

export default SecurityBadge;