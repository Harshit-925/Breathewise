import type { AirData, HouseholdProfile, StagnationResult, WhoMultipleResult, BestWindowsResult } from '../types/index.js';
import type { StructuredAdvice } from '../../server/ai/fallback.js';

export interface AirApiResponse {
  airData: AirData;
  stagnation: StagnationResult;
  whoMultiple: WhoMultipleResult;
  bestWindows: BestWindowsResult;
  attribution: string;
  isMock: boolean;
  isStale: boolean;
}

export interface GeocodeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone: string;
}

function getUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    return path;
  }
  return `http://localhost:3001${path}`;
}

export const apiService = {
  async getAirData(lat: number, lon: number): Promise<AirApiResponse> {
    const res = await fetch(getUrl(`/api/air?lat=${lat}&lon=${lon}`));
    if (!res.ok) {
      throw new Error(`Air data fetch failed: ${res.status}`);
    }
    return (await res.json()) as AirApiResponse;
  },

  async searchGeocode(query: string): Promise<GeocodeLocation[]> {
    if (!query.trim()) return [];
    const res = await fetch(getUrl(`/api/geocode?q=${encodeURIComponent(query)}`));
    if (!res.ok) return [];
    const data = (await res.json()) as { results: GeocodeLocation[] };
    return data.results ?? [];
  },

  async getAdvice(household: HouseholdProfile, airData: AirData, lang: 'en' | 'hi'): Promise<StructuredAdvice> {
    const res = await fetch(getUrl('/api/advice'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ household, airData, lang }),
    });
    if (!res.ok) {
      throw new Error(`Advice request failed: ${res.status}`);
    }
    return (await res.json()) as StructuredAdvice;
  },

  async askQuick(question: string, airData?: AirData, lang: 'en' | 'hi' = 'en'): Promise<{ answer: string; isEmergency?: boolean; isOffTopic?: boolean }> {
    const res = await fetch(getUrl('/api/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: { airData }, lang }),
    });
    if (!res.ok) {
      throw new Error(`Quick ask failed: ${res.status}`);
    }
    return (await res.json()) as { answer: string; isEmergency?: boolean; isOffTopic?: boolean };
  },

  async getUsage(): Promise<{ status: string; uptimeSeconds: number; cache: { itemsCached: number; maxCapacity: number } }> {
    const res = await fetch(getUrl('/api/usage'));
    if (!res.ok) {
      return { status: 'unknown', uptimeSeconds: 0, cache: { itemsCached: 0, maxCapacity: 0 } };
    }
    return (await res.json()) as { status: string; uptimeSeconds: number; cache: { itemsCached: number; maxCapacity: number } };
  },
};
