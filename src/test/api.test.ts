import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/index.js';

describe('api routes suite', () => {
  const app = createApp();

  beforeAll(() => {
    process.env['USE_MOCKS'] = 'true';
    process.env['ALLOWED_ORIGINS'] = 'http://localhost:5173,http://test.com';
  });

  it('GET /api returns gateway info', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Breathewise API Gateway');
  });

  it('permits requests from vercel.app domains via CORS', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://breathewise-preview.vercel.app');
    expect(res.status).toBe(200);
  });

  it('rejects unauthorized foreign origins with CORS error', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-attacker.com');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Origin not allowed');
  });

  it('GET /api/health returns status, uptime and cache size', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.cacheSize).toBe('number');
  });

  it('GET /api/usage returns rateLimits and cache statistics', async () => {
    const res = await request(app).get('/api/usage');
    expect(res.status).toBe(200);
    expect(res.body.rateLimits.general.limit).toBe(100);
    expect(res.body.cache.maxCapacity).toBeDefined();
  });

  it('GET /api/geocode?q=Delhi returns search results', async () => {
    const res = await request(app).get('/api/geocode?q=Delhi');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });

  it('GET /api/geocode without q returns 400 error', async () => {
    const res = await request(app).get('/api/geocode');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request data');
  });

  it('GET /api/air?lat=28.61&lon=77.20 returns air data and engine metrics', async () => {
    const res = await request(app).get('/api/air?lat=28.61&lon=77.20');
    expect(res.status).toBe(200);
    expect(res.body.airData).toBeDefined();
    expect(res.body.airData.aqi).toBeDefined();
    expect(res.body.stagnation).toBeDefined();
    expect(res.body.whoMultiple).toBeDefined();
    expect(res.body.bestWindows).toBeDefined();
    expect(res.body.attribution).toContain('Open-Meteo');
  });

  it('GET /api/air with missing parameters returns 400', async () => {
    const res = await request(app).get('/api/air?lat=28.61');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request data');
  });

  it('GET /api/air with out-of-range latitude returns 400', async () => {
    const res = await request(app).get('/api/air?lat=95&lon=77');
    expect(res.status).toBe(400);
  });

  it('POST /api/advice returns structured advice with valid household', async () => {
    const payload = {
      household: {
        id: 'hh-1',
        name: 'Family',
        members: [{ ageGroup: 'adult', activityLevel: 'light', mask: 'none', outdoorHoursPerDay: 2, maxPm25: 35 }],
        buildingType: 'standard',
        roomVolume: 50,
        hasPurifier: true,
        purifierCadr: 200,
      },
      airData: {
        city: 'Delhi',
        pm25: 120,
        pm10: 200,
        aqi: 184,
        standard: 'epa',
        hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, pm25: 120 })),
        updatedAt: new Date().toISOString(),
      },
      lang: 'en',
    };

    const res = await request(app).post('/api/advice').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.verdict).toBeDefined();
    expect(res.body.routine.length).toBeGreaterThan(0);
    expect(res.body.indoor.length).toBe(3);
    expect(res.body.disclaimer).toBeDefined();
  });

  it('POST /api/advice rejects unknown fields with 400 (strict validation)', async () => {
    const payload = {
      household: {
        id: 'hh-1',
        name: 'Family',
        members: [{ ageGroup: 'adult', activityLevel: 'light', mask: 'none', outdoorHoursPerDay: 2, maxPm25: 35 }],
        buildingType: 'standard',
        roomVolume: 50,
        hasPurifier: false,
      },
      airData: {
        city: 'Delhi',
        pm25: 100,
        pm10: 150,
        aqi: 174,
        standard: 'epa',
        hourly: [],
        updatedAt: new Date().toISOString(),
      },
      unknownInjectedField: 'malicious',
    };

    const res = await request(app).post('/api/advice').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request data');
  });

  it('POST /api/chat responds with SSE headers', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'What mask should I wear today?' }],
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('data:');
  });

  it('POST /api/chat triggers emergency redirect when emergency symptom is detected', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'My child has severe chest pain and cannot breathe' }],
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain('EMERGENCY WARNING');
  });

  it('POST /api/chat triggers off-topic redirect when unrelated topic asked', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'What is the current bitcoin stock price?' }],
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain('dedicated to air quality');
  });

  it('POST /api/chat with empty messages returns 400', async () => {
    const res = await request(app).post('/api/chat').send({ messages: [] });
    expect(res.status).toBe(400);
  });

  it('POST /api/ask returns quick answer', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Should I open windows right now?' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toBeDefined();
  });

  it('POST /api/ask with off-topic question detects isOffTopic', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Write python code for bubble sort' });
    expect(res.status).toBe(200);
    expect(res.body.isOffTopic).toBe(true);
  });
});
