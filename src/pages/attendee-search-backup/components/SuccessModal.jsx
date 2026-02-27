import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useAudioFeedback from '../../../hooks/useAudioFeedback';

const SuccessModal = ({ attendee, onClose }) => {
  const { playSuccessSound } = useAudioFeedback();

  useEffect(() => {
    playSuccessSound();

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose, playSuccessSound]);

  if (!attendee) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-elevation-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/10 mx-auto mb-4 md:mb-6">
            <Icon name="CheckCircle2" size={32} color="var(--color-success)" className="md:w-10 md:h-10" />
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center mb-2">
            Check-In Successful!
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-center mb-6 md:mb-8">
            {attendee?.fullName} has been successfully checked in
          </p>

          <div className="bg-muted rounded-xl p-4 md:p-6 space-y-3 md:space-y-4 mb-6 md:mb-8">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-base md:text-lg font-semibold text-foreground">{attendee?.fullName}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Email Address</p>
              <p className="text-sm md:text-base text-foreground break-all">{attendee?.email}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Ticket Type</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <Icon name="Ticket" size={16} color="var(--color-primary)" />
                <span className="text-sm md:text-base font-medium text-primary">{attendee?.ticketType}</span>
              </div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Check-In Time</p>
              <p className="text-sm md:text-base text-foreground">
                {new Date()?.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={onClose}
            fullWidth
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;