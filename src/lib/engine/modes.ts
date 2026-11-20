import type {
  CompareModeResult,
  ModeResult,
  TransportMode,
  TripInput,
} from '../../types/index.js';
import { EMISSION_FACTORS, MODE_EXPOSURE_MULTIPLIER } from '../constants.js';
import { BREATHING_RATES } from '../constants.js';

/**
 * Compare transport modes for a given trip, computing inhaled PM2.5 dose and CO2e.
 * Default modes: all defined in EMISSION_FACTORS.
 */
export function compareModes(
  trip: TripInput,
  pm25: number,
  modes?: readonly TransportMode[],
): CompareModeResult {
  const assumptions: string[] = [
    'Assumes constant ambient PM2.5 along entire route',
    'Breathing rate: light-activity adult (16 L/min)',
    'Exposure multipliers from literature estimates (UNVERIFIED)',
  ];
  const usedModes = modes ?? (Object.keys(EMISSION_FACTORS) as TransportMode[]);
  const breathingRateM3h = (BREATHING_RATES['light']!['adult']!) * 60 / 1000;
  const hours = trip.durationMinutes / 60;

  const results: ModeResult[] = usedModes.map(mode => {
    const multiplier = MODE_EXPOSURE_MULTIPLIER[mode] ?? 1;
    const emission = EMISSION_FACTORS[mode] ?? 0;
    const dose = pm25 * multiplier * breathingRateM3h * hours;
    const co2e = emission * trip.distanceKm;
    return {
      mode,
      inhaledPm25Ug: Math.max(0, dose),
      co2eKg: co2e,
      assumptions: [`Exposure multiplier for ${mode}: ${multiplier}`],
    };
  });

  return { results, assumptions };
}
