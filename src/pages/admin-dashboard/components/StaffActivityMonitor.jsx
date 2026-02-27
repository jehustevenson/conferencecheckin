import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const StaffActivityMonitor = ({ staffActivities }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-elevation-2 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent/10 p-3 rounded-xl">
          <Icon name="Users" size={24} color="var(--color-accent)" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Staff Activity</h2>
      </div>
      <div className="space-y-4">
        {staffActivities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
            <Image
              src={activity?.staffAvatar}
              alt={activity?.staffAvatarAlt}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm md:text-base font-semibold text-foreground truncate">
                  {activity?.staffName}
                </p>
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  {getTimeAgo(activity?.timestamp)}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                Checked in <span className="font-medium text-foreground">{activity?.attendeeName}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-lg text-xs font-medium">
                  <Icon name="CheckCircle2" size={12} />
                  {activity?.ticketType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 md:mt-6 py-3 text-sm md:text-base font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
        View All Activity
      </button>
    </div>
  );
};

export default StaffActivityMonitor;