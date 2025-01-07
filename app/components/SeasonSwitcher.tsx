'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Season } from '../dto/types';
import { ChevronDown } from 'lucide-react';

export function SeasonSwitcher() {
  const { user, currentSeason, setCurrentSeason } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && user.seasons && user.seasons.length > 0 && !currentSeason) {
      setCurrentSeason(user.seasons[0]);
    }
  }, [user, currentSeason, setCurrentSeason]);

  if (!user || !user.seasons || user.seasons.length === 0) {
    return null;
  }

  const handleSeasonChange = (season: Season) => {
    setCurrentSeason(season);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
      >
        <span>{currentSeason ? currentSeason.name : 'Select Season'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-10">
          {user.seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => handleSeasonChange(season)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {season.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

