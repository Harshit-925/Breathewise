import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { HouseholdProfile, PledgeAction, PledgeActionType } from '../types/index.js';
import { storageService, DEFAULT_HOUSEHOLD } from '../services/storageService.js';

export type TabId = 'today' | 'routine' | 'indoor' | 'alternatives' | 'impact' | 'community' | 'chat';

export interface LocationInfo {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export interface AppContextType {
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  household: HouseholdProfile;
  setHousehold: (h: HouseholdProfile) => void;
  location: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  simulationMultiplier: number;
  setSimulationMultiplier: (multiplier: number) => void;
  pledges: PledgeAction[];
  togglePledge: (type: PledgeActionType) => void;
  clearAllData: () => void;
  exportData: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'en' | 'hi'>(() => storageService.getLang());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storageService.getTheme());
  const [household, setHouseholdState] = useState<HouseholdProfile>(() => storageService.getHousehold());
  const [location, setLocation] = useState<LocationInfo>({
    name: 'Delhi',
    lat: 28.6139,
    lon: 77.2090,
    country: 'India',
  });
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [simulationMultiplier, setSimulationMultiplier] = useState<number>(1.0);
  const [pledges, setPledgesState] = useState<PledgeAction[]>(() => storageService.getPledges());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storageService.saveTheme(theme);
  }, [theme]);

  const setLang = useCallback((newLang: 'en' | 'hi') => {
    setLangState(newLang);
    storageService.saveLang(newLang);
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  const setHousehold = useCallback((newProfile: HouseholdProfile) => {
    setHouseholdState(newProfile);
    storageService.saveHousehold(newProfile);
  }, []);

  const togglePledge = useCallback((type: PledgeActionType) => {
    setPledgesState((prev) => {
      const exists = prev.find((p) => p.type === type);
      const updated = exists ? prev.filter((p) => p.type !== type) : [...prev, { type, count: 1 }];
      storageService.savePledges(updated);
      return updated;
    });
  }, []);

  const clearAllData = useCallback(() => {
    storageService.clearAll();
    setHouseholdState(DEFAULT_HOUSEHOLD);
    setPledgesState([]);
    setSimulationMultiplier(1.0);
  }, []);

  const exportData = useCallback(() => {
    const jsonStr = storageService.exportAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breathewise-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const value: AppContextType = {
    lang,
    setLang,
    theme,
    setTheme,
    household,
    setHousehold,
    location,
    setLocation,
    activeTab,
    setActiveTab,
    simulationMultiplier,
    setSimulationMultiplier,
    pledges,
    togglePledge,
    clearAllData,
    exportData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
