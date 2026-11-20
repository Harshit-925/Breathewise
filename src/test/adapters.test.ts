import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchGeocode } from '../../server/adapters/geocode.js';
import { fetchAirQuality, transformToAirData } from '../../server/adapters/airQuality.js';
import { fetchWeather } from '../../server/adapters/weather.js';

describe('adapters suite', () => {
  beforeEach(() => {
    process.env['USE_MOCKS'] = 'true';
    vi.restoreAllMocks();
  });

  it('searchGeocode returns matching mock cities', async () => {
    const results = await searchGeocode('Delhi');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.name).toBe('Delhi');
    expect(results[0]?.country).toBe('India');
  });

  it('searchGeocode normalizes query case and whitespace', async () => {
    const res1 = await searchGeocode('  delhi  ');
    const res2 = await searchGeocode('DELHI');
    expect(res1[0]?.id).toBe(res2[0]?.id);
  });

  it('searchGeocode returns default cities for unknown queries in mock mode', async () => {
    const results = await searchGeocode('UnknownCityXYZ');
    expect(results.length).toBeGreaterThan(0);
  });

  it('fetchAirQuality returns 24-hour mock data', async () => {
    const air = await fetchAirQuality(28.61, 77.20);
    expect(air.current.pm2_5).toBeGreaterThan(0);
    expect(air.current.pm10).toBeGreaterThan(0);
    expect(air.hourly.pm2_5.length).toBe(24);
    expect(air.isMock).toBe(true);
  });

  it('fetchAirQuality caches response for same coordinates', async () => {
    const air1 = await fetchAirQuality(28.61, 77.20);
    const air2 = await fetchAirQuality(28.61, 77.20);
    expect(air1).toEqual(air2);
  });

  it('transformToAirData correctly computes EPA AQI and formats fields', () => {
    const raw = {
      current: { pm2_5: 35.4, pm10: 70 },
      hourly: {
        time: ['2026-11-20T00:00Z'],
        pm2_5: [35.4],
        pm10: [70],
      },
      isMock: true,
    };
    const transformed = transformToAirData('Delhi', raw, { temperature: 20, windSpeed: 2.5 });
    expect(transformed.city).toBe('Delhi');
    expect(transformed.pm25).toBe(35.4);
    expect(transformed.aqi).toBe(100);
    expect(transformed.temperature).toBe(20);
    expect(transformed.windSpeed).toBe(2.5);
  });

  it('fetchWeather returns current and hourly forecast in mock mode', async () => {
    const weather = await fetchWeather(28.61, 77.20);
    expect(weather.current.temperature_2m).toBeDefined();
    expect(weather.current.wind_speed_10m).toBeDefined();
    expect(weather.hourly.temperature_2m.length).toBe(24);
    expect(weather.hourly.wind_speed_10m.length).toBe(24);
  });

  it('fetchWeather caches responses', async () => {
    const w1 = await fetchWeather(19.07, 72.87);
    const w2 = await fetchWeather(19.07, 72.87);
    expect(w1).toBe(w2);
  });

  it('searchGeocode makes real fetch when USE_MOCKS is false and mocked fetch returns data', async () => {
    process.env['USE_MOCKS'] = 'false';
    const fakeData = {
      results: [{ id: 99, name: 'TestCity', latitude: 10, longitude: 20, country: 'TestLand', timezone: 'UTC' }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    }));

    const results = await searchGeocode('UniqueTestQuery');
    expect(results[0]?.name).toBe('TestCity');
  });

  it('fetchAirQuality falls back to mock if network fails when USE_MOCKS is false', async () => {
    process.env['USE_MOCKS'] = 'false';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    const air = await fetchAirQuality(12.34, 56.78);
    expect(air.hourly.pm2_5.length).toBe(24);
  });

  it('transformToAirData handles missing weather gracefully', () => {
    const raw = {
      current: { pm2_5: 12.0, pm10: 20 },
      hourly: { time: [], pm2_5: [], pm10: [] },
    };
    const transformed = transformToAirData('Clean City', raw);
    expect(transformed.temperature).toBeUndefined();
    expect(transformed.windSpeed).toBeUndefined();
    expect(Math.round(transformed.aqi)).toBe(56);
  });

  it('fetchWeather falls back to mock on network failure', async () => {
    process.env['USE_MOCKS'] = 'false';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection timed out')));

    const weather = await fetchWeather(5.0, 10.0);
    expect(weather.current.temperature_2m).toBe(18.5);
  });
});
