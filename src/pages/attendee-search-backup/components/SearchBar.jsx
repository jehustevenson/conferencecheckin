import React from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ searchQuery, onSearchChange, onSearch, isSearching }) => {
  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && searchQuery?.trim()) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Input
          type="search"
          label="Search Attendees"
          placeholder="Enter name, email, or phone number"
          value={searchQuery}
          onChange={(e) => onSearchChange(e?.target?.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
          className="pr-12"
        />
        <button
          onClick={onSearch}
          disabled={!searchQuery?.trim() || isSearching}
          className="absolute right-2 top-[38px] p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250"
          aria-label="Search attendees"
        >
          <Icon name={isSearching ? 'Loader2' : 'Search'} size={20} className={isSearching ? 'animate-spin' : ''} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-2 px-1">
        Search by full name, email address, or phone number
      </p>
    </div>
  );
};

export default SearchBar;