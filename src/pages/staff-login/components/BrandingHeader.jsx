import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingHeader = () => {
  return (
    <div className="text-center space-y-3 md:space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-elevation-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
          }}>
          <Icon name="Calendar" size={40} color="#FFFFFF" className="md:w-12 md:h-12 lg:w-14 lg:h-14" />
        </div>
      </div>
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
          Conference Check-In
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
          Staff Authentication Portal
        </p>
      </div>
    </div>
  );
};

export default BrandingHeader;