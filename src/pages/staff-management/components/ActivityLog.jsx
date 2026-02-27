import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityLog = ({ activities }) => {
  const getActivityIcon = (action) => {
    if (action?.includes('checked in')) return 'CheckCircle';
    if (action?.includes('logged in')) return 'LogIn';
    if (action?.includes('logged out')) return 'LogOut';
    return 'Activity';
  };

  const getActivityColor = (action) => {
    if (action?.includes('checked in')) return 'text-success';
    if (action?.includes('logged in')) return 'text-primary';
    if (action?.includes('logged out')) return 'text-muted-foreground';
    return 'text-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Icon name="Activity" size={24} className="text-primary" />
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="space-y-3 md:space-y-4">
        {activities?.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">No recent activity</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-250"
            >
              <div className={`flex-shrink-0 ${getActivityColor(activity?.action)}`}>
                <Icon name={getActivityIcon(activity?.action)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base text-foreground font-medium mb-1">
                  {activity?.staffName}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">
                  {activity?.action}
                </p>
                <p className="text-xs text-muted-foreground opacity-75">
                  {activity?.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;