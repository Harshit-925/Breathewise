import type { HouseholdProfile, PledgeAction } from '../types/index.js';

const HOUSEHOLD_KEY = 'breathewise_household_v1';
const PLEDGES_KEY = 'breathewise_pledges_v1';
const THEME_KEY = 'breathewise_theme_v1';
const LANG_KEY = 'breathewise_lang_v1';

export const DEFAULT_HOUSEHOLD: HouseholdProfile = {
  id: 'hh-default',
  name: 'My Household',
  members: [
    {
      ageGroup: 'adult',
      activityLevel: 'moderate',
      mask: 'N95',
      outdoorHoursPerDay: 2,
      maxPm25: 35,
    },
  ],
  buildingType: 'standard',
  roomVolume: 45,
  hasPurifier: false,
  purifierCadr: 200,
};

export const storageService = {
  getHousehold(): HouseholdProfile {
    try {
      const raw = localStorage.getItem(HOUSEHOLD_KEY);
      if (!raw) return DEFAULT_HOUSEHOLD;
      return JSON.parse(raw) as HouseholdProfile;
    } catch {
      return DEFAULT_HOUSEHOLD;
    }
  },

  saveHousehold(profile: HouseholdProfile): void {
    try {
      localStorage.setItem(HOUSEHOLD_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save household to localStorage', e);
    }
  },

  getPledges(): PledgeAction[] {
    try {
      const raw = localStorage.getItem(PLEDGES_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as PledgeAction[];
    } catch {
      return [];
    }
  },

  savePledges(pledges: PledgeAction[]): void {
    try {
      localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
    } catch (e) {
      console.warn('Failed to save pledges to localStorage', e);
    }
  },

  getTheme(): 'light' | 'dark' {
    try {
      const val = localStorage.getItem(THEME_KEY);
      if (val === 'dark' || val === 'light') return val;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  },

  getLang(): 'en' | 'hi' {
    try {
      const val = localStorage.getItem(LANG_KEY);
      return val === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  },

  saveLang(lang: 'en' | 'hi'): void {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      console.warn('Failed to save lang', e);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(HOUSEHOLD_KEY);
      localStorage.removeItem(PLEDGES_KEY);
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(LANG_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  },

  exportAsJson(): string {
    const data = {
      household: this.getHousehold(),
      pledges: this.getPledges(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },
};
