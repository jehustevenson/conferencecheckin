import React, { useState } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import OperationalToolbar from '../../components/ui/OperationalToolbar';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActions from '../../components/ui/QuickActions';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import CheckInConfirmationModal from './components/CheckInConfirmationModal';
import SuccessModal from './components/SuccessModal';
import ErrorMessage from './components/ErrorMessage';
import { searchParticipants, checkInParticipant } from '../../services/participantService';
import { useAuth } from '../../contexts/AuthContext';
import useAudioFeedback from '../../hooks/useAudioFeedback';

const AttendeeSearchBackup = () => {
  const { user } = useAuth();
  const { playSuccessSound, playErrorSound } = useAudioFeedback();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery?.trim()) return;

    setIsSearching(true);
    setError(null);

    const { data, error: searchError } = await searchParticipants(searchQuery?.trim());

    if (searchError) {
      setError(searchError);
      playErrorSound();
    } else {
      setSearchResults(data || []);
    }

    setHasSearched(true);
    setIsSearching(false);
  };

  const handleCheckIn = (attendee) => {
    if (attendee?.checkedIn) return;
    setSelectedAttendee(attendee);
  };

  const handleConfirmCheckIn = async () => {
    if (!selectedAttendee) return;
    setIsProcessing(true);

    const { data: updatedAttendee, error: checkInError } = await checkInParticipant(
      selectedAttendee?.id,
      user?.id
    );

    if (checkInError) {
      setError(checkInError);
      setIsProcessing(false);
      setSelectedAttendee(null);
      playErrorSound();
      return;
    }

    setSearchResults(prev =>
      prev?.map(att => att?.id === updatedAttendee?.id ? updatedAttendee : att)
    );

    setIsProcessing(false);
    setSelectedAttendee(null);
    setShowSuccessModal(updatedAttendee);
    playSuccessSound();
  };

  const handleCancelCheckIn = () => {
    setSelectedAttendee(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="staff" />
      <OperationalToolbar isVisible={true} />

      <div className="pt-[104px] sm:pt-[112px] md:pt-[128px] pb-8 md:pb-12 lg:pb-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                Manual Attendee Search
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Search and check in attendees manually when QR scanning is unavailable
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <StatusIndicator connectionStatus="connected" />
              <QuickActions userName={user?.user_metadata?.full_name || 'Staff Member'} userRole="staff" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-elevation-2 p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-elevation-2 p-4 md:p-6 lg:p-8">
            {error ? (
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            ) : (
              <SearchResults
                results={searchResults}
                onCheckIn={handleCheckIn}
                isProcessing={isProcessing}
                hasSearched={hasSearched}
              />
            )}
          </div>
        </div>
      </div>

      {selectedAttendee && (
        <CheckInConfirmationModal
          attendee={selectedAttendee}
          onConfirm={handleConfirmCheckIn}
          onCancel={handleCancelCheckIn}
          isProcessing={isProcessing}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          attendee={showSuccessModal}
          onClose={handleCloseSuccessModal}
        />
      )}
    </div>
  );
};

export default AttendeeSearchBackup;