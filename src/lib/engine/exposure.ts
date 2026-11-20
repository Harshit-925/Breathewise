import type {
  BestWindowsResult,
  HourlyData,
  InhaledDoseResult,
  OutdoorWindow,
  Persona,
} from '../../types/index.js';
import { BREATHING_RATES, MASK_EFFICIENCY } from '../constants.js';

/**
 * Calculate inhaled PM2.5 dose in micrograms.
 * dose = pm25 × hours × breathingRate(L/min→m³/h) × ioRatio × (1 − filtration)
 */
export function inhaledDose(
  pm25: number,
  hours: number,
  breathingRateLpm: number,
  ioRatio: number = 1,
  filtration: number = 0,
): InhaledDoseResult {
  const assumptions: string[] = [];
  if (!Number.isFinite(pm25) || pm25 < 0) {
    assumptions.push('Invalid PM2.5 treated as 0');
    return { doseUg: 0, assumptions };
  }
  const rateM3h = breathingRateLpm * 60 / 1000; // L/min → m³/h
  const dose = pm25 * hours * rateM3h * ioRatio * (1 - filtration);
  assumptions.push('Assumes constant PM2.5 and breathing rate over period');
  return { doseUg: Math.max(0, dose), assumptions };
}

/**
 * Find the best contiguous outdoor windows where PM2.5 is below the persona's threshold.
 * Returns windows sorted by average PM2.5 ascending.
 */
export function bestOutdoorWindows(
  hourly: readonly HourlyData[],
  persona: Persona,
): BestWindowsResult {
  const assumptions: string[] = [];
  if (hourly.length === 0) {
    assumptions.push('No hourly data provided');
    return { windows: [], assumptions };
  }
  assumptions.push(`Uses persona maxPm25 threshold of ${persona.maxPm25} µg/m³`);

  const windows: OutdoorWindow[] = [];
  let start: number | null = null;
  let sum = 0;
  let count = 0;

  for (let i = 0; i <= hourly.length; i++) {
    const entry = hourly[i];
    const below = entry !== undefined && entry.pm25 <= persona.maxPm25;
    if (below && entry !== undefined) {
      if (start === null) start = entry.hour;
      sum += entry.pm25;
      count++;
    } else {
      if (start !== null && count > 0) {
        const prev = hourly[i - 1];
        windows.push({ startHour: start, endHour: prev!.hour, avgPm25: sum / count });
      }
      start = null;
      sum = 0;
      count = 0;
    }
  }
  windows.sort((a, b) => a.avgPm25 - b.avgPm25);
  return { windows, assumptions };
}

/**
 * Look up breathing rate for an age group and activity level (L/min).
 */
export function getBreathingRate(ageGroup: string, activity: string): number {
  return BREATHING_RATES[activity]?.[ageGroup] ?? BREATHING_RATES['rest']!['adult']!;
}

/**
 * Look up typical mask filtration efficiency (0–1).
 */
export function getMaskEfficiency(maskType: string): number {
  return MASK_EFFICIENCY[maskType]?.typical ?? 0;
}
