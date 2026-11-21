import { describe, it, expect } from 'vitest';
import {
  sanitizeUserInput,
  wrapUserInput,
  checkEmergencySymptoms,
  checkOffTopic,
  EMERGENCY_REDIRECT_MESSAGE,
} from '../../server/ai/guardrails.js';
import { generateCacheKey, getCachedResponse, setCachedResponse } from '../../server/ai/cache.js';
import { generateFallbackAdvice } from '../../server/ai/fallback.js';
import { generateAdviceWithGemini, overwriteWithDeterministicEngine } from '../../server/ai/gemini.js';
import { StructuredAdviceSchema } from '../../server/schemas/index.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';
import type { HouseholdProfile, AirData } from '../../src/types/index.js';

describe('ai layer suite', () => {
  const sampleHousehold: HouseholdProfile = {
    id: 'hh-1',
    name: 'Sharma Family',
    members: [
      { ageGroup: 'child', activityLevel: 'moderate', mask: 'surgical', outdoorHoursPerDay: 2, maxPm25: 35 },
      { ageGroup: 'elderly', activityLevel: 'rest', mask: 'N95', outdoorHoursPerDay: 1, maxPm25: 25 },
    ],
    buildingType: 'standard',
    roomVolume: 60,
    hasPurifier: true,
    purifierCadr: 250,
  };

  const sampleAirData: AirData = {
    city: 'New Delhi',
    pm25: 180,
    pm10: 290,
    aqi: 230,
    standard: 'epa',
    hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, pm25: 180 })),
    updatedAt: new Date().toISOString(),
  };

  it('sanitizeUserInput strips null bytes and non-printable control characters', () => {
    const malicious = 'Hello\x00\x08World\x1F!';
    expect(sanitizeUserInput(malicious)).toBe('HelloWorld!');
  });

  it('sanitizeUserInput collapses extra whitespace', () => {
    const input = '   Too    many    spaces    ';
    expect(sanitizeUserInput(input)).toBe('Too many spaces');
  });

  it('sanitizeUserInput truncates at max length', () => {
    const long = 'A'.repeat(1500);
    expect(sanitizeUserInput(long, 50).length).toBe(50);
  });

  it('wrapUserInput sanitizes and wraps with <user_input> tag', () => {
    const wrapped = wrapUserInput('Can I go running?');
    expect(wrapped).toBe('<user_input>Can I go running?</user_input>');
  });

  it('checkEmergencySymptoms identifies critical medical distress keywords', () => {
    expect(checkEmergencySymptoms('I have intense chest pain right now')).toBe(true);
    expect(checkEmergencySymptoms("help I can't breathe")).toBe(true);
    expect(checkEmergencySymptoms('patient has blue lips and is gasping')).toBe(true);
    expect(checkEmergencySymptoms('what is the best filter?')).toBe(false);
  });

  it('checkEmergencySymptoms identifies Hindi emergency distress phrases', () => {
    expect(checkEmergencySymptoms('मुझे सांस नहीं आ रही है')).toBe(true);
    expect(checkEmergencySymptoms('मरीज के सीने में दर्द है')).toBe(true);
  });

  it('checkOffTopic flags completely irrelevant topics', () => {
    expect(checkOffTopic('who will win the football match tonight?')).toBe(true);
    expect(checkOffTopic('give me a recipe for chocolate cake')).toBe(true);
    expect(checkOffTopic('write python script to scrape data')).toBe(true);
    expect(checkOffTopic('how to reduce indoor PM2.5?')).toBe(false);
  });

  it('generateCacheKey produces consistent SHA256 hashes', () => {
    const k1 = generateCacheKey('advice', { a: 1, b: 'test' });
    const k2 = generateCacheKey('advice', { a: 1, b: 'test' });
    expect(k1).toBe(k2);
    expect(k1.length).toBe(64);
  });

  it('setCachedResponse and getCachedResponse correctly store and retrieve values', () => {
    const key = generateCacheKey('test', { id: 123 });
    setCachedResponse(key, 'cached_result_value');
    expect(getCachedResponse(key)).toBe('cached_result_value');
  });

  it('generateFallbackAdvice returns 3 distinct indoor tiers', () => {
    const advice = generateFallbackAdvice(sampleHousehold, sampleAirData, 'en');
    expect(advice.indoor.length).toBe(3);
    expect(advice.indoor.map((i) => i.tier)).toEqual(['diy', 'standard', 'premium']);
  });

  it('generateFallbackAdvice reflects room volume in CADR recommendations', () => {
    const advice = generateFallbackAdvice(sampleHousehold, sampleAirData, 'en');
    const expectedCadr = cadrRequired(sampleHousehold.roomVolume, 4).cadrM3h;
    const stdTier = advice.indoor.find((i) => i.tier === 'standard');
    expect(stdTier?.steps.some((s) => s.includes(String(expectedCadr)))).toBe(true);
  });

  it('generateFallbackAdvice provides Hindi translation when lang is hi', () => {
    const adviceHi = generateFallbackAdvice(sampleHousehold, sampleAirData, 'hi');
    expect(adviceHi.verdict.headline).toContain('वायु गुणवत्ता');
    expect(adviceHi.indoor[0]?.title).toContain('कोर्सी-रोसेन्थल');
  });

  it('generateFallbackAdvice always includes health disclaimer', () => {
    const advice = generateFallbackAdvice(sampleHousehold, sampleAirData, 'en');
    expect(advice.disclaimer).toContain('Not medical advice');
  });

  it('EMERGENCY_REDIRECT_MESSAGE directs user to emergency services', () => {
    expect(EMERGENCY_REDIRECT_MESSAGE).toContain('112 / 911 / 999');
  });

  // ─── Tests for Bug Fixes & Deterministic Engine Overwrite ───
  it('overwriteWithDeterministicEngine scales DIY purification time with room volume (20, 45, 120 m³)', () => {
    const volumes = [20, 45, 120];
    const cleanTimes = volumes.map((vol) => {
      const hh: HouseholdProfile = { ...sampleHousehold, roomVolume: vol };
      const fallback = generateFallbackAdvice(hh, sampleAirData, 'en');
      const overwritten = overwriteWithDeterministicEngine(fallback, hh, sampleAirData);
      const diy = overwritten.indoor.find((t) => t.tier === 'diy')!;

      // Extract minutes from: "Cleans X m³ in ~Y minutes"
      const match = diy.effect.match(/~(\d+)\s+minutes/);
      expect(match).not.toBeNull();
      const mins = parseInt(match![1]!, 10);
      expect(Number.isInteger(mins)).toBe(true);
      return mins;
    });

    // Clean times must strictly ascend with room volume
    expect(cleanTimes[0]!).toBeLessThan(cleanTimes[1]!);
    expect(cleanTimes[1]!).toBeLessThan(cleanTimes[2]!);

    // Expected DIY physical values for CADR = 350 m³/h, eff = 0.90, target = 0.90:
    // 20 m³: ~9 min, 45 m³: ~20 min, 120 m³: ~53 min
    expect(cleanTimes[0]).toBe(Math.round(purificationTime(20, 350, 0.90, 0, 0.90).minutes));
    expect(cleanTimes[1]).toBe(Math.round(purificationTime(45, 350, 0.90, 0, 0.90).minutes));
    expect(cleanTimes[2]).toBe(Math.round(purificationTime(120, 350, 0.90, 0, 0.90).minutes));
  });

  it('overwriteWithDeterministicEngine overwrites all indoor tiers and all alternatives', () => {
    const rawAdvice = generateFallbackAdvice(sampleHousehold, sampleAirData, 'en');
    const overwritten = overwriteWithDeterministicEngine(rawAdvice, sampleHousehold, sampleAirData);

    // Verify all 3 indoor tiers overwritten
    expect(overwritten.indoor.length).toBe(3);
    const diy = overwritten.indoor.find((t) => t.tier === 'diy')!;
    const standard = overwritten.indoor.find((t) => t.tier === 'standard')!;
    const premium = overwritten.indoor.find((t) => t.tier === 'premium')!;

    expect(diy.assumptions).toContain('DIY Corsi-Rosenthal Box (CADR ~350 m³/h)');
    expect(standard.effect).toContain('Certified HEPA rated for 240 m³/h CADR'); // 60 * 4 = 240
    expect(premium.effect).toContain('Hospital-grade HEPA + Carbon rated for 360 m³/h CADR'); // 60 * 6 = 360

    // Verify alternatives overwritten
    expect(overwritten.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(typeof overwritten.alternatives[0]!.exposureDelta).toBe('number');
    expect(typeof overwritten.alternatives[0]!.co2eDelta).toBe('number');
    expect(typeof overwritten.alternatives[1]!.exposureDelta).toBe('number');
    expect(typeof overwritten.alternatives[1]!.co2eDelta).toBe('number');
  });

  it('StructuredAdviceSchema validates well-formed advice and catches malformed payloads', () => {
    const valid = generateFallbackAdvice(sampleHousehold, sampleAirData, 'en');
    const parseResult = StructuredAdviceSchema.safeParse(valid);
    expect(parseResult.success).toBe(true);

    const invalid = { ...valid, verdict: { ...valid.verdict, level: 'super-bad' } };
    const invalidResult = StructuredAdviceSchema.safeParse(invalid);
    expect(invalidResult.success).toBe(false);
  });

  it('generateAdviceWithGemini falls back and deterministically overwrites when no API key is provided', async () => {
    const advice = await generateAdviceWithGemini(sampleHousehold, sampleAirData, 'en');
    expect(advice.verdict.level).toBeDefined();
    expect(advice.indoor.length).toBe(3);
    expect(advice.disclaimer).toContain('Not medical advice');
  });
});
