import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ThemeToggle } from './ThemeToggle.js';
import { LanguageSwitch } from './LanguageSwitch.js';
import { apiService, type GeocodeLocation } from '../../services/apiService.js';

export const Header: React.FC<{ isMock?: boolean; isSimulation?: boolean }> = ({
  isMock = false,
  isSimulation = false,
}) => {
  const { location, setLocation, lang, clearAllData, exportData } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeLocation[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const cities = await apiService.searchGeocode(val);
      setResults(cities);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectCity = (c: GeocodeLocation) => {
    setLocation({
      name: c.name,
      lat: c.latitude,
      lon: c.longitude,
      country: c.country,
    });
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow">
            B
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
              Breathewise
              {isSimulation && (
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-300">
                  Simulation, not live data
                </span>
              )}
              {!isSimulation && isMock && (
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                  Sample data
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'hi' ? 'शहरी वायु गुणवत्ता और स्मॉग सहायक' : 'Urban Air Quality & Smog Assistant'}
            </p>
          </div>
        </div>

        {/* Location selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium hover:border-blue-500 transition-colors"
            aria-expanded={searchOpen}
            aria-label={`Change city, currently ${location.name}`}
          >
            <span aria-hidden="true">📍</span>
            <span>{location.name}, {location.country}</span>
            <span aria-hidden="true" className="text-xs text-slate-400">▼</span>
          </button>

          {searchOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2">
              <input
                type="text"
                value={query}
                onChange={(e) => void handleSearch(e.target.value)}
                placeholder="Search city (e.g. Delhi, London)..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm mb-2 focus:outline-blue-500"
                autoFocus
              />
              {searching && <p className="text-xs text-slate-500 p-2">Searching...</p>}
              <ul className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCity(c)}
                      className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <strong className="block">{c.name}</strong>
                      <span className="text-slate-500 text-[11px]">{c.admin1 ? `${c.admin1}, ` : ''}{c.country}</span>
                    </button>
                  </li>
                ))}
                {!searching && query.length >= 2 && results.length === 0 && (
                  <li className="p-2 text-slate-500">No matching cities found</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportData}
            title="Export profile and data as JSON"
            aria-label="Export profile and data as JSON"
            className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            💾 Export
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all stored household profile and pledges?')) {
                clearAllData();
              }
            }}
            title="Clear my data from browser"
            aria-label="Clear my data from browser"
            className="p-1.5 text-xs rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            🗑️ Clear
          </button>
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
