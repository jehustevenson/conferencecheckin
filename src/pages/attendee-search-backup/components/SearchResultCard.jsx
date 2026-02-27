import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchResultCard = ({ attendee, onCheckIn, isProcessing }) => {
  const isCheckedIn = attendee?.checkedIn;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-all duration-250">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCheckedIn ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Icon 
                name={isCheckedIn ? 'CheckCircle2' : 'User'} 
                size={24} 
                color={isCheckedIn ? 'var(--color-success)' : 'var(--color-muted-foreground)'} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 truncate">
                {attendee?.fullName}
              </h3>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                isCheckedIn 
                  ? 'bg-success/10 text-success' :'bg-warning/10 text-warning'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isCheckedIn ? 'bg-success' : 'bg-warning'
                }`} />
                {isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Icon name="Mail" size={16} className="flex-shrink-0" />
              <span className="truncate">{attendee?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Icon name="Phone" size={16} className="flex-shrink-0" />
              <span>{attendee?.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Icon name="Ticket" size={16} className="flex-shrink-0" />
              <span className="font-medium">{attendee?.ticketType}</span>
            </div>
          </div>

          {isCheckedIn && attendee?.checkedInAt && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Icon name="Clock" size={14} className="flex-shrink-0" />
                  <span>{new Date(attendee.checkedInAt)?.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                {attendee?.checkedInBy && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="UserCheck" size={14} className="flex-shrink-0" />
                    <span>by {attendee?.checkedInBy}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {!isCheckedIn ? (
            <Button
              variant="success"
              size="lg"
              onClick={() => onCheckIn(attendee)}
              disabled={isProcessing}
              loading={isProcessing}
              iconName="CheckCircle2"
              iconPosition="left"
              fullWidth
              className="lg:w-auto"
            >
              Check In
            </Button>
          ) : (
            <div className="flex items-center justify-center lg:justify-start gap-2 px-4 py-3 bg-success/10 rounded-lg">
              <Icon name="CheckCircle2" size={20} color="var(--color-success)" />
              <span className="text-sm font-medium text-success">Already Checked In</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;