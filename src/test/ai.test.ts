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
import { cadrRequired } from '../../src/lib/engine/cadr.js';
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
});
