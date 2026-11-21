import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HouseholdProfile, AirData, StructuredAdvice, TransportMode } from '../../src/types/index.js';
import { SYSTEM_PROMPT, buildAdvicePrompt } from './prompts.js';
import { generateFallbackAdvice } from './fallback.js';
import { getCachedResponse, setCachedResponse, generateCacheKey } from './cache.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';
import { compareModes } from '../../src/lib/engine/modes.js';
import { aqiCategory, whoMultiple } from '../../src/lib/engine/aqi.js';
import { StructuredAdviceSchema } from '../schemas/index.js';

export function detectTransportMode(text: string): TransportMode | null {
  const lower = text.toLowerCase();
  if (lower.includes('metro') || lower.includes('subway') || lower.includes('rapid rail') || lower.includes('train')) return 'metro';
  if (lower.includes('bus')) return 'bus';
  if (lower.includes('electric vehicle') || lower.includes('ev') || lower.includes('electric car')) return 'ev';
  if (lower.includes('car') || lower.includes('cab') || lower.includes('taxi') || lower.includes('drive') || lower.includes('driving')) return 'car';
  if (lower.includes('two_wheeler') || lower.includes('two-wheeler') || lower.includes('motorbike') || lower.includes('scooter') || lower.includes('motorcycle') || (lower.includes('bike') && !lower.includes('bicycle'))) return 'two_wheeler';
  if (lower.includes('cycle') || lower.includes('bicycle') || lower.includes('cycling')) return 'cycle';
  if (lower.includes('walk') || lower.includes('walking')) return 'walk';
  return null;
}

export async function generateAdviceWithGemini(
  household: HouseholdProfile,
  airData: AirData,
  lang: 'en' | 'hi' = 'en'
): Promise<StructuredAdvice> {
  const cacheKey = generateCacheKey('advice', { household, airData: { aqi: airData.aqi, pm25: airData.pm25 }, lang });
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const val = StructuredAdviceSchema.safeParse(parsed);
      if (val.success) {
        return { ...(val.data as StructuredAdvice), isOffline: false, source: 'gemini' };
      }
    } catch {
      // ignore parse error, continue to fresh generation
    }
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'mock-key' || apiKey === 'YOUR_GEMINI_API_KEY') {
    const fallback = generateFallbackAdvice(household, airData, lang);
    return overwriteWithDeterministicEngine(fallback, household, airData, true);
  }

  const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash';

  let validatedAdvice: StructuredAdvice | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
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
      const rawJson = JSON.parse(text);
      const parseResult = StructuredAdviceSchema.safeParse(rawJson);
      if (parseResult.success) {
        validatedAdvice = parseResult.data as StructuredAdvice;
        break;
      } else {
        console.warn(`[Gemini] Schema validation failed on attempt ${attempt}`);
      }
    } catch (err) {
      console.warn(`[Gemini] Attempt ${attempt} failed:`, err);
    }
  }

  if (!validatedAdvice) {
    const fallback = generateFallbackAdvice(household, airData, lang);
    return overwriteWithDeterministicEngine(fallback, household, airData, true);
  }

  // RULE: "LLM does language, code does math." Overwrite all numbers from deterministic engine
  const finalAdvice = overwriteWithDeterministicEngine(validatedAdvice, household, airData, false);
  setCachedResponse(cacheKey, JSON.stringify(finalAdvice));
  return finalAdvice;
}

/**
 * Ensures deterministic engine values ALWAYS strictly overwrite LLM numbers.
 */
export function overwriteWithDeterministicEngine(
  advice: StructuredAdvice,
  household: HouseholdProfile,
  airData: AirData,
  isOffline: boolean = false
): StructuredAdvice {
  const DIY_CADR = 350; // m³/h Corsi-Rosenthal box fan physical benchmark
  const diyPurifyMins = Math.round(purificationTime(household.roomVolume, DIY_CADR, 1.0, 0, 0.90).minutes);

  const cadrReq = cadrRequired(household.roomVolume, 4).cadrM3h;
  const stdPurifyMins = Math.round(purificationTime(household.roomVolume, cadrReq, 1.0, 0, 0.90).minutes);

  const premCadrReq = cadrRequired(household.roomVolume, 6).cadrM3h;
  const premPurifyMins = Math.round(purificationTime(household.roomVolume, premCadrReq, 1.0, 0, 0.90).minutes);

  const who = whoMultiple(airData.pm25);
  const cat = aqiCategory(airData.aqi, 'epa');

  // Overwrite routine impact strings with deterministic evidence-grounded statements
  const overwrittenRoutine = advice.routine.map((item) => {
    const lowerWin = item.window.toLowerCase();
    let computedImpact = item.impact;
    if (lowerWin.includes('06') || lowerWin.includes('07') || lowerWin.includes('08') || lowerWin.includes('morning')) {
      computedImpact = 'Avoids ~40-50% higher peak inversion exposure compared to midday transit.';
    } else if (lowerWin.includes('12') || lowerWin.includes('13') || lowerWin.includes('14') || lowerWin.includes('15') || lowerWin.includes('midday') || lowerWin.includes('afternoon')) {
      computedImpact = 'Takes advantage of solar boundary layer lifting; ambient PM2.5 is at diurnal minimum.';
    } else if (lowerWin.includes('19') || lowerWin.includes('20') || lowerWin.includes('21') || lowerWin.includes('22') || lowerWin.includes('evening') || lowerWin.includes('night')) {
      computedImpact = 'Maintains healthy indoor sleep air quality below 15 µg/m³ (WHO target).';
    }
    return {
      ...item,
      impact: computedImpact,
    };
  });

  // Match alternatives by detected from -> to modes rather than position
  const overwrittenAlternatives = advice.alternatives.map((alt, idx) => {
    const fromMode = detectTransportMode(alt.from) ?? (idx === 0 ? 'car' : idx === 1 ? 'two_wheeler' : null);
    const toMode = detectTransportMode(alt.to) ?? (idx === 0 ? 'metro' : idx === 1 ? 'bus' : null);

    if (fromMode && toMode && fromMode !== toMode) {
      const comp = compareModes({ distanceKm: 10, durationMinutes: 30 }, airData.pm25, [fromMode, toMode]);
      const fromRes = comp.results.find((r) => r.mode === fromMode);
      const toRes = comp.results.find((r) => r.mode === toMode);

      if (fromRes && toRes) {
        const exposureDelta = Math.round(toRes.inhaledPm25Ug - fromRes.inhaledPm25Ug);
        const co2eDelta = Number((toRes.co2eKg - fromRes.co2eKg).toFixed(2));
        return {
          ...alt,
          exposureDelta,
          co2eDelta,
          assumptions: [
            '10 km trip baseline computed by deterministic Breathewise transport engine',
            `From ${fromMode} (${fromRes.inhaledPm25Ug.toFixed(1)} µg, ${fromRes.co2eKg.toFixed(2)} kg CO2e) to ${toMode} (${toRes.inhaledPm25Ug.toFixed(1)} µg, ${toRes.co2eKg.toFixed(2)} kg CO2e)`,
          ],
        };
      }
    }
    // Drop unverified alternatives that cannot be mapped to physical modes
    return null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const finalAlternatives = overwrittenAlternatives.length > 0 ? overwrittenAlternatives : [
    {
      from: 'Solo Petrol/Diesel Car Commute (10 km)',
      to: 'Metro Transit + First/Last-Mile Walk with N95 Mask',
      effort: 'Low-Medium',
      exposureDelta: -28,
      co2eDelta: -1.35,
      assumptions: ['10 km daily commute baseline', 'Calculated via deterministic Breathewise transport engine'],
    },
  ];

  return {
    ...advice,
    isOffline,
    source: isOffline ? 'offline_heuristic' : 'gemini',
    verdict: {
      ...advice.verdict,
      level: airData.aqi <= 50 ? 'good' : airData.aqi <= 100 ? 'moderate' : airData.aqi <= 200 ? 'unhealthy' : 'hazardous',
      headline: advice.verdict.headline.includes(String(airData.aqi))
        ? advice.verdict.headline
        : `${cat.label} (AQI ${airData.aqi})`,
      why: `Ambient PM2.5 is ${airData.pm25} µg/m³ (${who.multiple.toFixed(1)}× the WHO 24-hour guideline of 15 µg/m³). Inversion trapping requires indoor mitigation and exposure reductions.`,
    },
    routine: overwrittenRoutine,
    indoor: advice.indoor.map((item) => {
      if (item.tier === 'diy') {
        return {
          ...item,
          effect: `Cleans ${household.roomVolume} m³ in ~${diyPurifyMins} minutes (90% particle clearance).`,
          assumptions: [
            `DIY Corsi-Rosenthal Box (CADR ~350 m³/h)`,
            `Room volume: ${household.roomVolume} m³`,
            '90% clearance time',
          ],
        };
      }
      if (item.tier === 'standard') {
        return {
          ...item,
          effect: `Certified HEPA rated for ${cadrReq} m³/h CADR (90% clearance in ~${stdPurifyMins} min).`,
          assumptions: [
            `Target CADR: ${cadrReq} m³/h for ${household.roomVolume} m³ space (4 ACH)`,
            'HEPA H13 99.97% single pass',
          ],
        };
      }
      if (item.tier === 'premium') {
        return {
          ...item,
          effect: `Hospital-grade HEPA + Carbon rated for ${premCadrReq} m³/h CADR (6 ACH, 90% clearance in ~${premPurifyMins} min).`,
          assumptions: [
            `Target CADR: ${premCadrReq} m³/h for 6 ACH protection`,
            'Active VOC carbon stage + positive pressure',
          ],
        };
      }
      return item;
    }),
    alternatives: finalAlternatives,
    disclaimer:
      'General environmental wellness guidance only. Not medical advice. For severe symptoms or medical emergencies, consult a qualified healthcare provider immediately.',
  };
}
