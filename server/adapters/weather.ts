import { LRUCache } from 'lru-cache';

export interface RawWeatherResponse {
  readonly current: {
    readonly temperature_2m: number;
    readonly wind_speed_10m: number;
  };
  readonly hourly: {
    readonly time: readonly string[];
    readonly temperature_2m: readonly number[];
    readonly wind_speed_10m: readonly number[];
    readonly relative_humidity_2m: readonly number[];
    readonly surface_pressure: readonly number[];
  };
  readonly isMock?: boolean;
}

const cache = new LRUCache<string, RawWeatherResponse>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

function createMockWeather(): RawWeatherResponse {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return {
    current: {
      temperature_2m: 18.5,
      wind_speed_10m: 2.1,
    },
    hourly: {
      time: hours.map((h) => `2026-11-20T${String(h).padStart(2, '0')}:00Z`),
      temperature_2m: hours.map((h) => 15 + Math.sin(h / 3) * 5),
      wind_speed_10m: hours.map((h) => 1.5 + Math.cos(h / 4) * 1.5),
      relative_humidity_2m: hours.map(() => 65),
      surface_pressure: hours.map(() => 1012),
    },
    isMock: true,
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<RawWeatherResponse> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  if (process.env['USE_MOCKS'] === 'true') {
    const mock = createMockWeather();
    cache.set(cacheKey, mock);
    return mock;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,relative_humidity_2m,surface_pressure&current=temperature_2m,wind_speed_10m`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Weather HTTP error ${res.status}`);
      }

      const data = (await res.json()) as RawWeatherResponse;
      cache.set(cacheKey, data);
      return data;
    } catch {
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }

  const mockFallback = createMockWeather();
  return mockFallback;
}
