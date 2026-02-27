import React from 'react';
import Icon from '../../../components/AppIcon';

const TicketTypeBreakdown = ({ ticketTypes }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-elevation-2 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Icon name="Ticket" size={24} color="var(--color-primary)" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Check-In by Ticket Type</h2>
      </div>
      <div className="space-y-4 md:space-y-6">
        {ticketTypes?.map((ticket) => (
          <div key={ticket?.type} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getProgressColor(ticket?.percentage)}`} />
                <span className="text-sm md:text-base font-semibold text-foreground">{ticket?.type}</span>
              </div>
              <div className="text-right">
                <span className="text-lg md:text-xl font-bold text-foreground">{ticket?.checkedIn}</span>
                <span className="text-sm md:text-base text-muted-foreground">/{ticket?.total}</span>
              </div>
            </div>
            
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getProgressColor(ticket?.percentage)} transition-all duration-500 rounded-full`}
                style={{ width: `${ticket?.percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">{ticket?.percentage}% Complete</span>
              <span className="text-muted-foreground">{ticket?.remaining} Remaining</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTypeBreakdown;