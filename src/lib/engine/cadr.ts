import type {
  CadrRequiredResult,
  HourlyData,
  PurificationTimeResult,
  WindowScheduleResult,
  WindowScheduleSlot,
} from '../../types/index.js';

/**
 * Calculate the minimum CADR (m³/h) needed to achieve a target air-change rate.
 * CADR = volume × targetAch
 */
export function cadrRequired(
  volume: number,
  targetAch: number,
): CadrRequiredResult {
  const assumptions: string[] = ['CADR = room volume × target ACH'];
  if (volume <= 0 || targetAch <= 0) {
    assumptions.push('Non-positive inputs; returning 0');
    return { cadrM3h: 0, assumptions };
  }
  return { cadrM3h: volume * targetAch, assumptions };
}

/**
 * Estimate minutes to reach target PM2.5 reduction.
 * Uses exponential decay: t = −V / (CADR × η − naturalLoss) × ln(1 − target_fraction) × 60.
 * Default targetFraction = 0.632 (one e-fold / 63% reduction).
 * Pass targetFraction = 0.90 for 90% clearance.
 */
export function purificationTime(
  volume: number,
  cadr: number,
  efficiency: number = 0.95,
  naturalLoss: number = 0,
  targetFraction: number = 0.632,
): PurificationTimeResult {
  const isOneEFold = Math.abs(targetFraction - 0.632) < 0.01;
  const assumptions: string[] = [
    'Assumes well-mixed room (single-zone model)',
    isOneEFold
      ? 'Returns time for one e-fold (63 % PM2.5 reduction)'
      : `Returns time for ${(targetFraction * 100).toFixed(0)} % PM2.5 reduction`,
  ];
  const effectiveRate = cadr * efficiency - naturalLoss;
  if (effectiveRate <= 0 || volume <= 0) {
    assumptions.push('Effective rate ≤ 0; purification not achievable');
    return { minutes: Infinity, assumptions };
  }
  const decayFactor = isOneEFold ? 1 : -Math.log(1 - Math.min(0.999, Math.max(0.01, targetFraction)));
  const hours = (volume / effectiveRate) * decayFactor;
  return { minutes: hours * 60, assumptions };
}

/**
 * Recommend window-opening schedule based on hourly PM2.5 and wind speed.
 * A slot is recommended when PM2.5 < 35 µg/m³ AND wind ≥ 2 m/s.
 */
export function windowSchedule(
  hourlyPm25: readonly HourlyData[],
  _hourlyWind?: readonly HourlyData[],
): WindowScheduleResult {
  const assumptions: string[] = [
    'Recommends opening when PM2.5 < 35 µg/m³ and wind ≥ 2 m/s',
  ];
  const PM25_THRESHOLD = 35;
  const WIND_THRESHOLD = 2;

  const slots: WindowScheduleSlot[] = hourlyPm25.map(entry => {
    const wind = entry.windSpeed ?? 0;
    return {
      hour: entry.hour,
      pm25: entry.pm25,
      windSpeed: wind,
      recommended: entry.pm25 < PM25_THRESHOLD && wind >= WIND_THRESHOLD,
    };
  });
  return { slots, assumptions };
}
