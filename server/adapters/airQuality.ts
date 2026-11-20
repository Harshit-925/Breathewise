import { LRUCache } from 'lru-cache';
import type { AirData, HourlyData } from '../../src/types/index.js';
import { pm25ToAqi } from '../../src/lib/engine/aqi.js';

export interface RawAirQualityResponse {
  readonly current: {
    readonly pm2_5: number;
    readonly pm10: number;
    readonly us_aqi?: number;
    readonly european_aqi?: number;
    readonly carbon_monoxide?: number;
    readonly nitrogen_dioxide?: number;
    readonly sulphur_dioxide?: number;
    readonly ozone?: number;
  };
  readonly hourly: {
    readonly time: readonly string[];
    readonly pm2_5: readonly number[];
    readonly pm10: readonly number[];
  };
  readonly isMock?: boolean;
  readonly isStale?: boolean;
}

const cache = new LRUCache<string, { data: RawAirQualityResponse; timestamp: number }>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

function createMockAirQuality(lat: number, lon: number): RawAirQualityResponse {
  // Deterministic mock based on coordinates
  const basePm25 = Math.abs(Math.sin(lat + lon) * 120) + 15;
  const hourlyTime: string[] = [];
  const hourlyPm25: number[] = [];
  const hourlyPm10: number[] = [];

  for (let h = 0; h < 24; h++) {
    hourlyTime.push(`2026-11-20T${String(h).padStart(2, '0')}:00Z`);
    // Morning and evening peak pattern
    const peak = (h >= 7 && h <= 10) || (h >= 19 && h <= 22) ? 1.5 : 0.8;
    const pm = Math.round(basePm25 * peak);
    hourlyPm25.push(pm);
    hourlyPm10.push(Math.round(pm * 1.6));
  }

  return {
    current: {
      pm2_5: Math.round(basePm25),
      pm10: Math.round(basePm25 * 1.6),
      carbon_monoxide: 450,
      nitrogen_dioxide: 35,
      sulphur_dioxide: 12,
      ozone: 40,
    },
    hourly: {
      time: hourlyTime,
      pm2_5: hourlyPm25,
      pm10: hourlyPm10,
    },
    isMock: true,
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<RawAirQualityResponse> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 5) {
    return cached.data;
  }

  if (process.env['USE_MOCKS'] === 'true') {
    const mock = createMockAirQuality(lat, lon);
    cache.set(cacheKey, { data: mock, timestamp: Date.now() });
    return mock;
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi,european_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Air Quality HTTP error ${res.status}`);
      }

      const data = (await res.json()) as RawAirQualityResponse;
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }

  // Stale fallback
  if (cached) {
    return { ...cached.data, isStale: true };
  }

  // Mock fallback if network fails completely
  const mockFallback = { ...createMockAirQuality(lat, lon), isStale: true };
  return mockFallback;
}

export function transformToAirData(
  city: string,
  raw: RawAirQualityResponse,
  weather?: { temperature?: number; humidity?: number; windSpeed?: number }
): AirData {
  const pm25 = raw.current.pm2_5;
  const pm10 = raw.current.pm10;
  const computedAqi = pm25ToAqi(pm25).aqi;

  const hourly: HourlyData[] = raw.hourly.pm2_5.slice(0, 24).map((pm, idx) => ({
    hour: idx,
    pm25: pm,
    windSpeed: weather?.windSpeed,
  }));

  return {
    city,
    pm25,
    pm10,
    aqi: computedAqi,
    standard: 'epa',
    hourly,
    temperature: weather?.temperature,
    humidity: weather?.humidity,
    windSpeed: weather?.windSpeed,
    updatedAt: new Date().toISOString(),
  };
}
