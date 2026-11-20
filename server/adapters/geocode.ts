import { LRUCache } from 'lru-cache';

export interface GeocodeResult {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly admin1?: string;
  readonly timezone: string;
  readonly isMock?: boolean;
}

const cache = new LRUCache<string, GeocodeResult[]>({
  max: 200,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

const MOCK_CITIES: GeocodeResult[] = [
  { id: 1, name: 'Delhi', latitude: 28.6139, longitude: 77.2090, country: 'India', admin1: 'Delhi', timezone: 'Asia/Kolkata', isMock: true },
  { id: 2, name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China', admin1: 'Beijing', timezone: 'Asia/Shanghai', isMock: true },
  { id: 3, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', admin1: 'England', timezone: 'Europe/London', isMock: true },
  { id: 4, name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'United States', admin1: 'California', timezone: 'America/Los_Angeles', isMock: true },
  { id: 5, name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India', admin1: 'Maharashtra', timezone: 'Asia/Kolkata', isMock: true },
];

export async function searchGeocode(query: string): Promise<GeocodeResult[]> {
  const normalized = query.trim().toLowerCase();
  if (cache.has(normalized)) {
    return cache.get(normalized)!;
  }

  if (process.env['USE_MOCKS'] === 'true') {
    const matches = MOCK_CITIES.filter((c) => c.name.toLowerCase().includes(normalized));
    return matches.length > 0 ? matches : MOCK_CITIES.slice(0, 3);
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Geocode HTTP error ${res.status}`);
      }
      const data = (await res.json()) as { results?: Array<{
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country: string;
        admin1?: string;
        timezone: string;
      }> };

      const results: GeocodeResult[] = (data.results ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country,
        admin1: r.admin1,
        timezone: r.timezone,
      }));

      cache.set(normalized, results);
      return results;
    } catch (err) {
      lastError = err as Error;
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }

  // Fallback to mock on network failure
  const matches = MOCK_CITIES.filter((c) => c.name.toLowerCase().includes(normalized));
  if (matches.length > 0) return matches;
  throw lastError ?? new Error('Geocoding service unavailable');
}
