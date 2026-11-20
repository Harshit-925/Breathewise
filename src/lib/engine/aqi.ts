import type { AqiBreakpoint, AqiCategory, AqiResult, AqiStandard, WhoMultipleResult } from '../../types/index.js';
import { AQI_CATEGORIES, EPA_PM25_BREAKPOINTS, WHO_GUIDELINES } from '../constants.js';

/**
 * Convert PM2.5 concentration (µg/m³) to an AQI value using piecewise linear interpolation.
 * Returns AQI clamped to [0, 500]. Out-of-range concentrations extrapolate from the last segment.
 */
export function pm25ToAqi(
  conc: number,
  table: readonly AqiBreakpoint[] = EPA_PM25_BREAKPOINTS,
): AqiResult {
  const assumptions: string[] = [];
  if (!Number.isFinite(conc) || conc < 0) {
    assumptions.push('Non-positive or non-finite concentration clamped to 0');
    return { aqi: 0, assumptions };
  }

  const truncated = Math.floor(conc * 10) / 10; // truncate to 1 decimal
  for (const bp of table) {
    if (truncated >= bp.cLow && truncated <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (truncated - bp.cLow) + bp.iLow;
      return { aqi, assumptions };
    }
  }

  assumptions.push('Concentration exceeds breakpoint table; clamped to AQI 500');
  return { aqi: 500, assumptions };
}

/**
 * Look up the AQI category for a given AQI value.
 * @param _standard reserved for future multi-standard support
 */
export function aqiCategory(
  aqi: number,
  _standard: AqiStandard = 'epa',
): AqiCategory & { assumptions: readonly string[] } {
  const assumptions: string[] = [];
  const clamped = Math.max(0, Math.min(500, aqi));
  if (clamped !== aqi) assumptions.push('AQI clamped to [0, 500]');

  const cat = AQI_CATEGORIES.find(c => clamped >= c.min && clamped <= c.max);
  const fallback = AQI_CATEGORIES[AQI_CATEGORIES.length - 1]!;
  return { ...(cat ?? fallback), assumptions };
}

/**
 * Calculate how many times current PM2.5 exceeds the WHO 24-hour guideline (15 µg/m³).
 */
export function whoMultiple(pm25: number): WhoMultipleResult {
  const assumptions: string[] = ['Uses WHO 2021 24-h guideline of 15 µg/m³'];
  if (!Number.isFinite(pm25) || pm25 < 0) {
    assumptions.push('Non-positive or non-finite PM2.5 treated as 0');
    return { multiple: 0, guidelineValue: WHO_GUIDELINES.pm25_24hMean, assumptions };
  }
  const multiple = pm25 / WHO_GUIDELINES.pm25_24hMean;
  return { multiple, guidelineValue: WHO_GUIDELINES.pm25_24hMean, assumptions };
}
