import type { AirData, HourlyData, HouseholdProfile, StagnationResult, WhoMultipleResult, BestWindowsResult } from '../types/index.js';
import type { StructuredAdvice } from '../../server/ai/fallback.js';
import { generateFallbackAdvice } from '../../server/ai/fallback.js';
import { pm25ToAqi, whoMultiple } from '../lib/engine/aqi.js';
import { stagnationRisk } from '../lib/engine/stagnation.js';
import { bestOutdoorWindows } from '../lib/engine/exposure.js';
import { checkEmergencySymptoms, checkOffTopic, EMERGENCY_REDIRECT_MESSAGE, OFF_TOPIC_REDIRECT_MESSAGE } from '../../server/ai/guardrails.js';

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

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:'
  );
}

function getUrl(path: string): string {
  const envBase = typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: Record<string, string> }).env?.['VITE_API_BASE_URL']
    : undefined;
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}${path}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    return path;
  }
  return `http://localhost:3001${path}`;
}

async function fetchAirDataClientSide(lat: number, lon: number): Promise<AirApiResponse> {
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi,european_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=relative_humidity_2m`;

  try {
    const [airRes, weatherRes] = await Promise.all([
      fetch(airUrl),
      fetch(weatherUrl),
    ]);

    if (!airRes.ok) throw new Error(`Air Quality API error: ${airRes.status}`);

    const rawAir = await airRes.json() as {
      current?: { pm2_5?: number; pm10?: number };
      hourly?: { pm2_5?: number[] };
    };
    const rawWeather = weatherRes.ok
      ? (await weatherRes.json() as {
          current?: { temperature_2m?: number; wind_speed_10m?: number };
          hourly?: { relative_humidity_2m?: number[] };
        })
      : null;

    const pm25 = Math.round(rawAir.current?.pm2_5 ?? 75);
    const pm10 = Math.round(rawAir.current?.pm10 ?? (pm25 * 1.5));
    const computedAqi = pm25ToAqi(pm25).aqi;

    const weatherInfo = {
      temperature: rawWeather?.current?.temperature_2m ?? 22,
      windSpeed: rawWeather?.current?.wind_speed_10m ?? 2.1,
      humidity: rawWeather?.hourly?.relative_humidity_2m?.[0] ?? 55,
    };

    const hourly: HourlyData[] = (rawAir.hourly?.pm2_5?.slice(0, 24) ?? []).map((pm, idx) => ({
      hour: idx,
      pm25: Math.round(pm),
      windSpeed: weatherInfo.windSpeed,
    }));

    const airData: AirData = {
      city: 'Selected Location',
      pm25,
      pm10,
      aqi: computedAqi,
      standard: 'epa',
      hourly: hourly.length > 0 ? hourly : generateDefaultHourly(pm25),
      temperature: weatherInfo.temperature,
      humidity: weatherInfo.humidity,
      windSpeed: weatherInfo.windSpeed,
      updatedAt: new Date().toISOString(),
    };

    const stagnation = stagnationRisk({
      windSpeed: weatherInfo.windSpeed,
      mixingHeight: 600,
    });

    const who = whoMultiple(airData.pm25);
    const defaultPersona = {
      ageGroup: 'adult' as const,
      activityLevel: 'light' as const,
      mask: 'none' as const,
      outdoorHoursPerDay: 2,
      maxPm25: 35,
    };
    const bestWindows = bestOutdoorWindows(airData.hourly, defaultPersona);

    return {
      airData,
      stagnation,
      whoMultiple: who,
      bestWindows,
      attribution: 'Data: CAMS ENSEMBLE + Open-Meteo',
      isMock: false,
      isStale: false,
    };
  } catch {
    return generateClientMockAirData(lat, lon);
  }
}

function generateDefaultHourly(basePm25: number): HourlyData[] {
  const hourly: HourlyData[] = [];
  for (let h = 0; h < 24; h++) {
    const peak = (h >= 7 && h <= 10) || (h >= 19 && h <= 22) ? 1.4 : 0.85;
    hourly.push({ hour: h, pm25: Math.round(basePm25 * peak), windSpeed: 2.1 });
  }
  return hourly;
}

function generateClientMockAirData(lat: number, lon: number): AirApiResponse {
  const basePm25 = Math.abs(Math.sin(lat + lon) * 120) + 20;
  const hourly = generateDefaultHourly(basePm25);

  const airData: AirData = {
    city: 'Selected Location',
    pm25: Math.round(basePm25),
    pm10: Math.round(basePm25 * 1.6),
    aqi: pm25ToAqi(Math.round(basePm25)).aqi,
    standard: 'epa',
    hourly,
    temperature: 22,
    humidity: 55,
    windSpeed: 2.1,
    updatedAt: new Date().toISOString(),
  };

  return {
    airData,
    stagnation: stagnationRisk({ windSpeed: 2.1, mixingHeight: 600 }),
    whoMultiple: whoMultiple(airData.pm25),
    bestWindows: bestOutdoorWindows(hourly, {
      ageGroup: 'adult',
      activityLevel: 'light',
      mask: 'none',
      outdoorHoursPerDay: 2,
      maxPm25: 35,
    }),
    attribution: 'Sample Data (Offline Mode)',
    isMock: true,
    isStale: false,
  };
}

async function searchGeocodeClientSide(query: string): Promise<GeocodeLocation[]> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as { results?: GeocodeLocation[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

export function generateLiteAnswer(question: string, aqi = 120): string {
  const lower = question.toLowerCase();
  if (lower.includes('mask') || lower.includes('n95')) {
    return 'Wear an N95 or FFP2 respirator outdoors; cloth masks provide negligible filtration against hazardous fine PM2.5.';
  }
  if (lower.includes('window') || lower.includes('ventilat')) {
    return 'Keep windows closed during early morning and late evening smog peaks; open only briefly around 13:00-15:00 if fresh air is needed.';
  }
  if (lower.includes('purifier') || lower.includes('cadr')) {
    return 'Aim for 4 to 5 Air Changes per Hour (ACH). Use our Indoor Center to calculate required CADR for your room dimensions or build a DIY box fan filter.';
  }
  return `With AQI around ${aqi}, limit prolonged outdoor exertion and run HEPA air filtration in sleeping areas.`;
}

export const apiService = {
  async getAirData(lat: number, lon: number): Promise<AirApiResponse> {
    // If hosted statically (GitHub Pages), fetch directly from Open-Meteo to avoid 404
    if (isStaticHost()) {
      return fetchAirDataClientSide(lat, lon);
    }

    try {
      const res = await fetch(getUrl(`/api/air?lat=${lat}&lon=${lon}`));
      if (res.ok) {
        return (await res.json()) as AirApiResponse;
      }
    } catch {
      // Gateway unreachable, fall back to client-side direct fetch
    }

    return fetchAirDataClientSide(lat, lon);
  },

  async searchGeocode(query: string): Promise<GeocodeLocation[]> {
    if (!query.trim()) return [];

    if (isStaticHost()) {
      return searchGeocodeClientSide(query);
    }

    try {
      const res = await fetch(getUrl(`/api/geocode?q=${encodeURIComponent(query)}`));
      if (res.ok) {
        const data = (await res.json()) as { results: GeocodeLocation[] };
        return data.results ?? [];
      }
    } catch {
      // Gateway unreachable
    }

    return searchGeocodeClientSide(query);
  },

  async getAdvice(household: HouseholdProfile, airData: AirData, lang: 'en' | 'hi'): Promise<StructuredAdvice> {
    if (isStaticHost()) {
      return generateFallbackAdvice(household, airData, lang);
    }

    try {
      const res = await fetch(getUrl('/api/advice'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ household, airData, lang }),
      });
      if (res.ok) {
        return (await res.json()) as StructuredAdvice;
      }
    } catch {
      // Gateway unreachable
    }

    return generateFallbackAdvice(household, airData, lang);
  },

  async askQuick(
    question: string,
    airData?: AirData,
    _lang: 'en' | 'hi' = 'en'
  ): Promise<{ answer: string; isEmergency?: boolean; isOffTopic?: boolean }> {
    if (checkEmergencySymptoms(question)) {
      return { answer: EMERGENCY_REDIRECT_MESSAGE, isEmergency: true };
    }
    if (checkOffTopic(question)) {
      return { answer: OFF_TOPIC_REDIRECT_MESSAGE, isOffTopic: true };
    }

    if (isStaticHost()) {
      return { answer: generateLiteAnswer(question, airData?.aqi) };
    }

    try {
      const res = await fetch(getUrl('/api/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: { airData }, lang: _lang }),
      });
      if (res.ok) {
        return (await res.json()) as { answer: string; isEmergency?: boolean; isOffTopic?: boolean };
      }
    } catch {
      // Gateway unreachable
    }

    return { answer: generateLiteAnswer(question, airData?.aqi) };
  },

  async getUsage(): Promise<{ status: string; uptimeSeconds: number; cache: { itemsCached: number; maxCapacity: number } }> {
    if (isStaticHost()) {
      return { status: 'live (client-direct)', uptimeSeconds: Math.round(performance.now() / 1000), cache: { itemsCached: 1, maxCapacity: 100 } };
    }

    try {
      const res = await fetch(getUrl('/api/usage'));
      if (res.ok) {
        return (await res.json()) as { status: string; uptimeSeconds: number; cache: { itemsCached: number; maxCapacity: number } };
      }
    } catch {
      // Gateway unreachable
    }

    return { status: 'live (client-direct)', uptimeSeconds: Math.round(performance.now() / 1000), cache: { itemsCached: 1, maxCapacity: 100 } };
  },
};
