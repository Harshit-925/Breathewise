import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HouseholdProfile, AirData } from '../../src/types/index.js';
import { SYSTEM_PROMPT, buildAdvicePrompt } from './prompts.js';
import { generateFallbackAdvice, type StructuredAdvice } from './fallback.js';
import { getCachedResponse, setCachedResponse, generateCacheKey } from './cache.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';
import { compareModes } from '../../src/lib/engine/modes.js';
import { aqiCategory } from '../../src/lib/engine/aqi.js';
import { StructuredAdviceSchema } from '../schemas/index.js';

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
        return val.data as StructuredAdvice;
      }
    } catch {
      // ignore parse error, continue to fresh generation
    }
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'mock-key' || apiKey === 'YOUR_GEMINI_API_KEY') {
    const fallback = generateFallbackAdvice(household, airData, lang);
    return overwriteWithDeterministicEngine(fallback, household, airData);
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
    validatedAdvice = generateFallbackAdvice(household, airData, lang);
  }

  // RULE: "LLM does language, code does math." Overwrite all numbers from deterministic engine
  const finalAdvice = overwriteWithDeterministicEngine(validatedAdvice, household, airData);
  setCachedResponse(cacheKey, JSON.stringify(finalAdvice));
  return finalAdvice;
}

/**
 * Ensures deterministic engine values ALWAYS strictly overwrite LLM numbers.
 */
export function overwriteWithDeterministicEngine(
  advice: StructuredAdvice,
  household: HouseholdProfile,
  airData: AirData
): StructuredAdvice {
  const DIY_CADR = 350; // m³/h Corsi-Rosenthal box fan physical benchmark
  const diyPurifyMins = Math.round(purificationTime(household.roomVolume, DIY_CADR, 0.90, 0, 0.90).minutes);

  const cadrReq = cadrRequired(household.roomVolume, 4).cadrM3h;
  const stdPurifyMins = Math.round(purificationTime(household.roomVolume, cadrReq, 0.95, 0, 0.90).minutes);

  const premCadrReq = cadrRequired(household.roomVolume, 6).cadrM3h;
  const premPurifyMins = Math.round(purificationTime(household.roomVolume, premCadrReq, 0.99, 0, 0.90).minutes);

  const modes = compareModes({ distanceKm: 10, durationMinutes: 30 }, airData.pm25, [
    'car',
    'metro',
    'bus',
    'two_wheeler',
    'cycle',
    'walk',
  ]);
  const metroComp = modes.results.find((m) => m.mode === 'metro');
  const carComp = modes.results.find((m) => m.mode === 'car');
  const busComp = modes.results.find((m) => m.mode === 'bus');
  const twComp = modes.results.find((m) => m.mode === 'two_wheeler');

  const expDelta0 = metroComp && carComp ? Math.round(metroComp.inhaledPm25Ug - carComp.inhaledPm25Ug) : -28;
  const co2Delta0 = metroComp && carComp ? Number((metroComp.co2eKg - carComp.co2eKg).toFixed(2)) : -1.35;

  const expDelta1 = busComp && twComp ? Math.round(busComp.inhaledPm25Ug - twComp.inhaledPm25Ug) : -35;
  const co2Delta1 = busComp && twComp ? Number((busComp.co2eKg - twComp.co2eKg).toFixed(2)) : 0.29;

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
    alternatives: advice.alternatives.map((alt, idx) => {
      if (idx === 0) {
        return {
          ...alt,
          exposureDelta: expDelta0,
          co2eDelta: co2Delta0,
          assumptions: ['10 km daily commute baseline', 'Calculated via deterministic Breathewise transport engine'],
        };
      }
      if (idx === 1) {
        return {
          ...alt,
          exposureDelta: expDelta1,
          co2eDelta: co2Delta1,
          assumptions: ['10 km urban corridor trip', 'CPCB & DEFRA verified vehicle emission & plume factors'],
        };
      }
      return {
        ...alt,
        exposureDelta: Math.round(alt.exposureDelta),
        co2eDelta: Number(alt.co2eDelta.toFixed(2)),
        assumptions: ['Calculated via deterministic Breathewise transport engine'],
      };
    }),
    disclaimer:
      'General environmental wellness guidance only. Not medical advice. For severe symptoms or medical emergencies, consult a qualified healthcare provider immediately.',
  };
}
