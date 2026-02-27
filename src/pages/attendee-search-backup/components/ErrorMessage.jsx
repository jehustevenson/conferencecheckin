import React from 'react';
import Icon from '../../../components/AppIcon';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-error/10 flex items-center justify-center mb-4 md:mb-6">
        <Icon name="AlertCircle" size={32} color="var(--color-error)" className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
      </div>
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-2">
        Search Error
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md px-4 mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all duration-250"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;