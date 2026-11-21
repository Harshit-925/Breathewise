import type { AirData } from '../types/index.js';
import { pm25ToAqi } from './engine/aqi.js';
import { compareModes } from './engine/modes.js';
import {
  checkClientEmergency,
  checkClientOffTopic,
  CLIENT_EMERGENCY_REDIRECT_MESSAGE,
  CLIENT_OFF_TOPIC_REDIRECT_MESSAGE,
} from './clientFallback.js';

export function generateClientChatReply(userText: string, airData: AirData | null): string {
  if (checkClientEmergency(userText)) {
    return CLIENT_EMERGENCY_REDIRECT_MESSAGE;
  }
  if (checkClientOffTopic(userText)) {
    return CLIENT_OFF_TOPIC_REDIRECT_MESSAGE;
  }

  const lower = userText.toLowerCase();
  const pm25 = airData?.pm25 ?? 75;
  const aqi = airData?.aqi ?? pm25ToAqi(pm25).aqi;
  const isDefaultData = !airData;

  const offlinePrefix = isDefaultData
    ? '[Offline Mode • Default Baseline PM2.5 75 µg/m³, AQI ' + aqi + ']\n\n'
    : '[Offline Mode • Verified Engine Heuristics]\n\n';

  if (lower.includes('mask') || lower.includes('n95')) {
    return `${offlinePrefix}At current AQI ${aqi} (PM2.5: ${pm25} µg/m³), wearing a certified N95 or FFP2 respirator outdoors is strongly advised. Cloth or surgical masks capture only 30–65% of sub-2.5 micron particulates without an airtight perimeter seal, while certified N95s achieve ≥95% particle filtration efficiency.`;
  }
  if (lower.includes('window') || lower.includes('ventilat')) {
    return `${offlinePrefix}Keep windows strictly shut during early morning (06:00–09:00) and late evening (19:00–22:00) thermal inversion trapping. Midday solar convection (12:30–15:00) is the optimal window for brief 15-minute cross-ventilation if indoor CO2 exceeds healthy limits.`;
  }
  if (lower.includes('purifier') || lower.includes('cadr') || lower.includes('filter')) {
    return `${offlinePrefix}For effective room air purification, target 4 to 5 Air Changes per Hour (ACH). Use our Indoor Center tab to calculate the exact CADR required for your room volume, or build a DIY Corsi-Rosenthal box cleaner delivering ~350 m³/h CADR at a fraction of commercial cost.`;
  }
  if (lower.includes('travel') || lower.includes('commute') || lower.includes('metro') || lower.includes('car') || lower.includes('bike')) {
    const comp = compareModes({ distanceKm: 10, durationMinutes: 30 }, pm25, ['metro', 'two_wheeler', 'car']);
    const metroRes = comp.results.find((r) => r.mode === 'metro');
    const twRes = comp.results.find((r) => r.mode === 'two_wheeler');
    const carRes = comp.results.find((r) => r.mode === 'car');

    const doseSavedPct = twRes && metroRes && twRes.inhaledPm25Ug > 0
      ? Math.round(((twRes.inhaledPm25Ug - metroRes.inhaledPm25Ug) / twRes.inhaledPm25Ug) * 100)
      : 78;
    const co2SavedPct = carRes && metroRes && carRes.co2eKg > 0
      ? Math.round(((carRes.co2eKg - metroRes.co2eKg) / carRes.co2eKg) * 100)
      : 79;

    const metroDose = metroRes ? metroRes.inhaledPm25Ug.toFixed(1) : '19.7';
    const twDose = twRes ? twRes.inhaledPm25Ug.toFixed(1) : '90.0';

    return `${offlinePrefix}On a 10 km commute, electric metro cuts inhaled PM2.5 dose by ~${doseSavedPct}% versus a two-wheeler (${metroDose} µg vs ${twDose} µg) due to filtered transit cabins and avoidance of direct tailpipe plumes. Metro also cuts carbon emissions by ~${co2SavedPct}% compared to driving solo in a petrol/diesel car. Check our Alternatives tab for the lowest-exposure departure window.`;
  }
  return `${offlinePrefix}At current ambient AQI ${aqi} (${airData?.city ?? 'selected city'}), limit prolonged outdoor cardiovascular exercise. Consult the Routine Planner to schedule outdoor errands during cleaner afternoon hours and run indoor filtration in bedrooms.`;
}
