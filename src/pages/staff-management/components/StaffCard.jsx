import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const StaffCard = ({ staff, onRemoveStaff }) => {
  const isActive = staff?.sessionStatus === 'active';
  const roleColor = staff?.role === 'admin' ? 'text-accent' : 'text-primary';
  const statusColor = isActive ? 'text-success' : 'text-muted-foreground';

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-all duration-250">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={staff?.avatar}
            alt={staff?.avatarAlt}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-card ${isActive ? 'bg-success' : 'bg-muted'}`} />
        </div>

        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
              {staff?.name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-medium ${roleColor} bg-muted w-fit`}>
              <Icon name={staff?.role === 'admin' ? 'Shield' : 'User'} size={14} />
              {staff?.role === 'admin' ? 'Administrator' : 'Check-In Staff'}
            </span>
          </div>

          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Icon name="Mail" size={16} />
              <span className="truncate">{staff?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Icon name="Activity" size={16} className={statusColor} />
              <span className={statusColor}>
                {isActive ? 'Active Session' : 'Logged Out'}
              </span>
            </div>
          </div>
        </div>

        {staff?.role !== 'admin' && (
          <button
            onClick={() => onRemoveStaff(staff?.id)}
            className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors duration-250 self-end sm:self-auto"
            aria-label={`Remove ${staff?.name}`}
          >
            <Icon name="Trash2" size={20} />
          </button>
        )}
      </div>
      {staff?.lastActivity && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="Clock" size={16} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="block">Last Activity: {staff?.lastActivity?.action}</span>
              <span className="block opacity-75">{staff?.lastActivity?.timestamp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCard;