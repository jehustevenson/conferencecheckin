import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
  };

  const iconBgClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900/30',
    success: 'bg-emerald-100 dark:bg-emerald-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
  };

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 border border-border">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex-1">
          <p className="text-sm md:text-base text-muted-foreground font-medium mb-2">{title}</p>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgClasses?.[color]} p-3 md:p-4 rounded-xl`}>
          <Icon name={icon} size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" color={`var(--color-${color})`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={16} />
            <span className="text-xs md:text-sm font-semibold">{trendValue}</span>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground">vs last hour</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;