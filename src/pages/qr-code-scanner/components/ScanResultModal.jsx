import React from 'react';
import AppIcon from '../../../components/AppIcon';

const statusConfig = {
  found: {
    icon: 'User',
    iconBg: 'bg-primary/10',
    iconColor: 'var(--color-primary)',
    title: 'Attendee Found',
    titleColor: 'text-foreground',
    badgeBg: 'bg-primary/10 text-primary',
    badgeLabel: 'Ready to Check In',
  },
  success: {
    icon: 'CheckCircle',
    iconBg: 'bg-success/10',
    iconColor: 'var(--color-success)',
    title: 'Check-In Successful!',
    titleColor: 'text-success',
    badgeBg: 'bg-success/10 text-success',
    badgeLabel: 'Checked In',
  },
  already_checked_in: {
    icon: 'AlertCircle',
    iconBg: 'bg-warning/10',
    iconColor: 'var(--color-warning)',
    title: 'Already Checked In',
    titleColor: 'text-warning',
    badgeBg: 'bg-warning/10 text-warning',
    badgeLabel: 'Duplicate Scan',
  },
  not_found: {
    icon: 'XCircle',
    iconBg: 'bg-error/10',
    iconColor: 'var(--color-error)',
    title: 'Attendee Not Found',
    titleColor: 'text-error',
    badgeBg: 'bg-error/10 text-error',
    badgeLabel: 'Invalid QR Code',
  },
  error: {
    icon: 'AlertTriangle',
    iconBg: 'bg-error/10',
    iconColor: 'var(--color-error)',
    title: 'Check-In Failed',
    titleColor: 'text-error',
    badgeBg: 'bg-error/10 text-error',
    badgeLabel: 'Error',
  },
};

const ScanResultModal = ({ result, isProcessing, onConfirmCheckIn, onClose, onRescan }) => {
  const config = statusConfig?.[result?.status] || statusConfig?.not_found;
  const participant = result?.participant;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr)?.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={result?.status === 'found' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-elevation-4 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config?.iconBg}`}>
              <AppIcon name={config?.icon} size={22} color={config?.iconColor} />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${config?.titleColor}`}>{config?.title}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config?.badgeBg}`}>
                {config?.badgeLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <AppIcon name="X" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {participant ? (
            <div className="space-y-4">
              {/* Attendee Info */}
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {participant?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{participant?.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{participant?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ticket Type</p>
                    <p className="text-sm font-medium text-foreground">{participant?.ticketType || 'N/A'}</p>
                  </div>
                  {participant?.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-foreground">{participant?.phone}</p>
                    </div>
                  )}
                  {participant?.checkedIn && participant?.checkedInAt && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Checked In At</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(participant?.checkedInAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground text-center">{result?.message}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">{result?.message}</p>
              {result?.qrId && (
                <p className="text-xs text-muted-foreground/60 mt-2 font-mono break-all">QR: {result?.qrId}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-5 pt-0">
          {result?.status === 'found' && (
            <>
              <button
                onClick={onRescan}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <AppIcon name="X" size={16} />
                Cancel
              </button>
              <button
                onClick={onConfirmCheckIn}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <AppIcon name="CheckCircle" size={16} />
                    Confirm Check-In
                  </>
                )}
              </button>
            </>
          )}

          {result?.status !== 'found' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                <AppIcon name="X" size={16} />
                Close
              </button>
              <button
                onClick={onRescan}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <AppIcon name="RefreshCw" size={16} />
                Scan Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanResultModal;