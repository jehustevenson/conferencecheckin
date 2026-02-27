import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Staff',
      value: stats?.totalStaff,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active Sessions',
      value: stats?.activeSessions,
      icon: 'Activity',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Administrators',
      value: stats?.admins,
      icon: 'Shield',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Check-Ins Today',
      value: stats?.checkInsToday,
      icon: 'CheckCircle',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-all duration-250"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className={`p-2 md:p-3 rounded-lg ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {stat?.value}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            {stat?.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;