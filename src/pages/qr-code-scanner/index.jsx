import React, { useState, useCallback } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import OperationalToolbar from '../../components/ui/OperationalToolbar';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActions from '../../components/ui/QuickActions';
import CameraViewfinder from './components/CameraViewfinder';
import ScanResultModal from './components/ScanResultModal';
import { getParticipantByQrId, checkInParticipant } from '../../services/participantService';
import { useAuth } from '../../contexts/AuthContext';
import useAudioFeedback from '../../hooks/useAudioFeedback';
import AppIcon from '../../components/AppIcon';

const QrCodeScanner = () => {
  const { user } = useAuth();
  const { playSuccessSound, playErrorSound } = useAudioFeedback();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);

  const handleScanSuccess = useCallback(async (decodedText) => {
    // Debounce: prevent duplicate scans within 3 seconds
    const now = Date.now();
    if (now - lastScanTime < 3000) return;
    setLastScanTime(now);

    setIsScanning(false);
    setIsProcessing(true);

    const { data: participant, error } = await getParticipantByQrId(decodedText);

    if (error || !participant) {
      setScanResult({
        status: 'not_found',
        message: 'No attendee found for this QR code.',
        qrId: decodedText,
      });
      playErrorSound();
    } else if (participant?.checkedIn) {
      setScanResult({
        status: 'already_checked_in',
        participant,
        message: 'This attendee has already been checked in.',
      });
      playErrorSound();
    } else {
      setScanResult({
        status: 'found',
        participant,
        message: 'Attendee found. Confirm check-in.',
      });
    }

    setIsProcessing(false);
  }, [lastScanTime, playErrorSound]);

  const handleScanError = useCallback((errorMessage) => {
    // Silent - camera errors handled inside CameraViewfinder
  }, []);

  const handleConfirmCheckIn = async () => {
    if (!scanResult?.participant) return;
    setIsProcessing(true);

    const { data: updatedParticipant, error } = await checkInParticipant(
      scanResult?.participant?.id,
      user?.id
    );

    if (error) {
      setScanResult(prev => ({
        ...prev,
        status: 'error',
        message: error || 'Check-in failed. Please try again.',
      }));
      playErrorSound();
    } else {
      setScanResult({
        status: 'success',
        participant: updatedParticipant,
        message: 'Check-in successful!',
      });
      setScanCount(prev => prev + 1);
      playSuccessSound();
    }

    setIsProcessing(false);
  };

  const handleCloseModal = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleRescan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="staff" />
      <OperationalToolbar isVisible={true} />

      <div className="pt-[104px] sm:pt-[112px] md:pt-[128px] pb-8 md:pb-12 lg:pb-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                QR Code Scanner
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Scan attendee QR codes to check them in quickly
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              {scanCount > 0 && (
                <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full text-sm font-medium">
                  <AppIcon name="CheckCircle" size={16} />
                  <span>{scanCount} checked in</span>
                </div>
              )}
              <StatusIndicator connectionStatus="connected" />
              <QuickActions userName={user?.user_metadata?.full_name || 'Staff Member'} userRole="staff" />
            </div>
          </div>

          {/* Scanner Status Banner */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
            isProcessing
              ? 'bg-warning/10 text-warning border border-warning/20'
              : isScanning
              ? 'bg-success/10 text-success border border-success/20' :'bg-muted text-muted-foreground border border-border'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isProcessing ? 'bg-warning animate-pulse' : isScanning ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            }`} />
            <span>
              {isProcessing
                ? 'Processing scan...'
                : isScanning
                ? 'Scanner active — point camera at QR code' :'Scanner paused'}
            </span>
          </div>

          {/* Camera Viewfinder */}
          <CameraViewfinder
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            isScanning={isScanning}
          />

          {/* Rescan Button when paused */}
          {!isScanning && !scanResult && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRescan}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <AppIcon name="RefreshCw" size={18} />
                <span>Scan Again</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scan Result Modal */}
      {scanResult && (
        <ScanResultModal
          result={scanResult}
          isProcessing={isProcessing}
          onConfirmCheckIn={handleConfirmCheckIn}
          onClose={handleCloseModal}
          onRescan={handleRescan}
        />
      )}
    </div>
  );
};

export default QrCodeScanner;
