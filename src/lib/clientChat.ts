import type { AirData } from '../types/index.js';
import {
  checkEmergencySymptoms,
  checkOffTopic,
  EMERGENCY_REDIRECT_MESSAGE,
  OFF_TOPIC_REDIRECT_MESSAGE,
} from '../../server/ai/guardrails.js';

export function generateClientChatReply(userText: string, airData: AirData | null): string {
  if (checkEmergencySymptoms(userText)) {
    return EMERGENCY_REDIRECT_MESSAGE;
  }
  if (checkOffTopic(userText)) {
    return OFF_TOPIC_REDIRECT_MESSAGE;
  }

  const lower = userText.toLowerCase();
  const aqi = airData?.aqi ?? 120;
  const pm25 = airData?.pm25 ?? 75;

  if (lower.includes('mask') || lower.includes('n95')) {
    return `At current AQI ${aqi} (PM2.5: ${pm25} µg/m³), wearing a certified N95 or FFP2 respirator outdoors is strongly advised. Cloth or surgical masks do not create a tight facial seal and capture only 15–40% of sub-2.5 micron particulates, while N95s achieve over 95% particle filtration efficiency.`;
  }
  if (lower.includes('window') || lower.includes('ventilat')) {
    return `Keep windows strictly shut during early morning (06:00–09:00) and late evening (19:00–22:00) diurnal inversion trapping. Midday solar convection (13:00–15:00) is the optimal window for quick 15-minute cross-ventilation if indoor CO2 rises.`;
  }
  if (lower.includes('purifier') || lower.includes('cadr') || lower.includes('filter')) {
    return `For effective room air purification, aim for at least 4 to 5 Air Changes per Hour (ACH). Use our Indoor Center tab to calculate the exact CADR required for your room volume, or build a DIY Corsi-Rosenthal box fan cleaner with 4 MERV-13 filters at 1/5th the commercial cost.`;
  }
  if (lower.includes('travel') || lower.includes('commute') || lower.includes('metro') || lower.includes('car')) {
    return `Shifting your commute to an underground electric metro cuts inhaled PM2.5 dose by ~65% compared to two-wheeler travel, and reduces per-passenger carbon emissions by 75%+. Check our Alternatives tab for the lowest-exposure departure window.`;
  }
  return `At current ambient AQI ${aqi} (${airData?.city ?? 'your area'}), limit heavy outdoor cardiovascular exercise. Consult the Routine Planner to schedule outdoor chores during cleaner afternoon hours and run indoor filtration in bedrooms.`;
}
