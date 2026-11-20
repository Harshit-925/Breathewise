import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HouseholdProfile, AirData } from '../../src/types/index.js';
import { SYSTEM_PROMPT, buildAdvicePrompt } from './prompts.js';
import { generateFallbackAdvice, type StructuredAdvice } from './fallback.js';
import { getCachedResponse, setCachedResponse, generateCacheKey } from './cache.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';
import { compareModes } from '../../src/lib/engine/modes.js';
import { aqiCategory } from '../../src/lib/engine/aqi.js';

export async function generateAdviceWithGemini(
  household: HouseholdProfile,
  airData: AirData,
  lang: 'en' | 'hi' = 'en'
): Promise<StructuredAdvice> {
  const cacheKey = generateCacheKey('advice', { household, airData: { aqi: airData.aqi, pm25: airData.pm25 }, lang });
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as StructuredAdvice;
    } catch {
      // ignore parse error, continue to fresh generation
    }
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'mock-key' || apiKey === 'YOUR_GEMINI_API_KEY') {
    const fallback = generateFallbackAdvice(household, airData, lang);
    return overwriteWithDeterministicEngine(fallback, household, airData);
  }

  const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = buildAdvicePrompt(JSON.stringify(household, null, 2), JSON.stringify(airData, null, 2), lang);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as StructuredAdvice;

    // RULE: "LLM does language, code does math." Overwrite all numbers from deterministic engine
    const finalAdvice = overwriteWithDeterministicEngine(parsed, household, airData);
    setCachedResponse(cacheKey, JSON.stringify(finalAdvice));
    return finalAdvice;
  } catch {
    // Retry once or fallback
    const fallback = generateFallbackAdvice(household, airData, lang);
    return overwriteWithDeterministicEngine(fallback, household, airData);
  }
}

/**
 * Ensures deterministic engine values ALWAYS strictly overwrite LLM numbers.
 */
function overwriteWithDeterministicEngine(
  advice: StructuredAdvice,
  household: HouseholdProfile,
  airData: AirData
): StructuredAdvice {
  const cadrReq = cadrRequired(household.roomVolume, 4).cadrM3h;
  const purifyMins = purificationTime(household.roomVolume, cadrReq, 0.9).minutes;
  const modes = compareModes({ distanceKm: 10, durationMinutes: 30 }, airData.pm25, ['car', 'metro', 'bus', 'cycle']);
  const metroComp = modes.results.find((m) => m.mode === 'metro');
  const carComp = modes.results.find((m) => m.mode === 'car');

  const expDelta = metroComp && carComp ? Math.round(metroComp.inhaledPm25Ug - carComp.inhaledPm25Ug) : -28;
  const co2Delta = metroComp && carComp ? Number((metroComp.co2eKg - carComp.co2eKg).toFixed(2)) : -1.75;

  const cat = aqiCategory(airData.aqi, 'epa');

  return {
    ...advice,
    verdict: {
      ...advice.verdict,
      level: airData.aqi <= 50 ? 'good' : airData.aqi <= 100 ? 'moderate' : airData.aqi <= 200 ? 'unhealthy' : 'hazardous',
      headline: advice.verdict.headline.includes(String(airData.aqi))
        ? advice.verdict.headline
        : `${cat.label} (AQI ${airData.aqi})`,
    },
    indoor: advice.indoor.map((item) => {
      if (item.tier === 'diy') {
        return {
          ...item,
          effect: `Cleans ${household.roomVolume} m³ in ~${purifyMins} minutes.`,
          assumptions: [`Room volume: ${household.roomVolume} m³`, 'CADR ~300 m³/h', 'Target ACH: 4.0'],
        };
      }
      if (item.tier === 'standard') {
        return {
          ...item,
          effect: `Certified HEPA rated for ${cadrReq} m³/h CADR.`,
          assumptions: [`Target CADR: ${cadrReq} m³/h for ${household.roomVolume} m³ space`],
        };
      }
      return item;
    }),
    alternatives: advice.alternatives.map((alt, idx) => {
      if (idx === 0) {
        return {
          ...alt,
          exposureDelta: expDelta,
          co2eDelta: co2Delta,
          assumptions: ['10 km daily commute baseline', 'Calculated via deterministic Breathewise transport engine'],
        };
      }
      return alt;
    }),
    disclaimer:
      'General environmental wellness guidance only. Not medical advice. For severe symptoms or medical emergencies, consult a qualified healthcare provider immediately.',
  };
}
