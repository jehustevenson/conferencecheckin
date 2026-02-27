import React from 'react';
import SearchResultCard from './SearchResultCard';
import Icon from '../../../components/AppIcon';

const SearchResults = ({ results, onCheckIn, isProcessing, hasSearched }) => {
  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-muted flex items-center justify-center mb-4 md:mb-6">
          <Icon name="Search" size={32} color="var(--color-muted-foreground)" className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
        </div>
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-2">
          Search for Attendees
        </h3>
        <p className="text-sm md:text-base text-muted-foreground text-center max-w-md px-4">
          Enter a name, email, or phone number to find attendees
        </p>
      </div>
    );
  }

  if (results?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-warning/10 flex items-center justify-center mb-4 md:mb-6">
          <Icon name="UserX" size={32} color="var(--color-warning)" className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
        </div>
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-2">
          No Attendees Found
        </h3>
        <p className="text-sm md:text-base text-muted-foreground text-center max-w-md px-4">
          No results match your search criteria. Please try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Search Results ({results?.length})
        </h3>
        {results?.length === 10 && (
          <p className="text-xs md:text-sm text-muted-foreground">
            Showing first 10 results
          </p>
        )}
      </div>
      <div className="space-y-3 md:space-y-4">
        {results?.map((attendee) => (
          <SearchResultCard
            key={attendee?.id}
            attendee={attendee}
            onCheckIn={onCheckIn}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;