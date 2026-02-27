import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Icon from '../../../components/AppIcon';

const CameraViewfinder = ({ onScanSuccess, onScanError, isScanning }) => {
  const scannerRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let html5QrCode = null;

    const initializeScanner = async () => {
      try {
        setIsInitializing(true);
        setCameraError(null);

        html5QrCode = new Html5Qrcode("qr-reader");

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode?.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isScanning) {
              onScanSuccess(decodedText);
            }
          },
          (errorMessage) => {
            // Silent error handling for continuous scanning
          }
        );

        setIsInitializing(false);
      } catch (err) {
        console.error("Camera initialization error:", err);
        setCameraError("Unable to access camera. Please check permissions.");
        setIsInitializing(false);
        onScanError("Camera access denied");
      }
    };

    if (isScanning) {
      initializeScanner();
    }

    return () => {
      if (html5QrCode) {
        html5QrCode?.stop()?.catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [isScanning, onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-elevation-3 overflow-hidden">
        {/* Scanner Container */}
        <div className="relative bg-slate-900">
          <div id="qr-reader" ref={scannerRef} className="w-full" />
          
          {/* Scanning Overlay */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner Markers */}
              <div className="absolute top-8 left-8 w-12 h-12 md:w-16 md:h-16 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-12 h-12 md:w-16 md:h-16 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-12 h-12 md:w-16 md:h-16 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 border-b-4 border-r-4 border-primary rounded-br-lg" />
              
              {/* Scanning Line Animation */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
            </div>
          )}

          {/* Loading State */}
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-sm md:text-base font-medium">Initializing camera...</p>
              </div>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 p-6 md:p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CameraOff" size={32} color="var(--color-error)" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Camera Access Required</h3>
                <p className="text-sm md:text-base text-slate-300 mb-4">{cameraError}</p>
                <p className="text-xs md:text-sm text-slate-400">Please enable camera permissions in your browser settings and refresh the page.</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 md:p-6 bg-muted">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Info" size={20} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">Scanning Instructions</h4>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• Position QR code within the scanning area</li>
                <li>• Hold device steady for best results</li>
                <li>• Ensure adequate lighting</li>
                <li>• Keep QR code flat and unobstructed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraViewfinder;