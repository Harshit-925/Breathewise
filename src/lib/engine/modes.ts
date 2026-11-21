import type {
  CompareModeResult,
  ModeResult,
  TransportMode,
  TripInput,
} from '../../types/index.js';
import { EMISSION_FACTORS, MODE_EXPOSURE_MULTIPLIER, MODE_PHYSICS } from '../constants.js';

/**
 * Compare transport modes for a given trip, computing inhaled PM2.5 dose and CO2e.
 * Models mode-specific realistic urban speeds and physical exertion breathing rates.
 */
export function compareModes(
  trip: TripInput,
  pm25: number,
  modes?: readonly TransportMode[],
): CompareModeResult {
  const assumptions: string[] = [
    'Assumes constant ambient PM2.5 along trip distance',
    'Mode-specific travel speeds and exertion breathing rates (MODE_PHYSICS)',
    'Exposure multipliers from transport microenvironment literature (Empirical)',
  ];
  const usedModes = modes ?? (Object.keys(EMISSION_FACTORS) as TransportMode[]);

  const results: ModeResult[] = usedModes.map(mode => {
    const physics = MODE_PHYSICS[mode] ?? {
      speedKmh: 20,
      breathingRateLpm: 16,
      exposureMultiplier: MODE_EXPOSURE_MULTIPLIER[mode] ?? 1,
      emissionFactorKgKm: EMISSION_FACTORS[mode] ?? 0,
    };

    // Mode-specific realistic trip duration in hours
    const durationHours = trip.distanceKm > 0 ? trip.distanceKm / physics.speedKmh : trip.durationMinutes / 60;
    const durationMinutes = Math.round(durationHours * 60);

    const breathingRateM3h = (physics.breathingRateLpm * 60) / 1000;
    const dose = pm25 * physics.exposureMultiplier * breathingRateM3h * durationHours;
    const co2e = physics.emissionFactorKgKm * trip.distanceKm;

    return {
      mode,
      inhaledPm25Ug: Math.max(0, dose),
      co2eKg: co2e,
      durationMinutes,
      speedKmh: physics.speedKmh,
      assumptions: [
        `Speed: ${physics.speedKmh} km/h (~${durationMinutes} min for ${trip.distanceKm} km)`,
        `Breathing rate: ${physics.breathingRateLpm} L/min (${physics.breathingRateLpm >= 24 ? 'exertion' : 'seated'})`,
        `Exposure multiplier: ${physics.exposureMultiplier}`,
      ],
    };
  });

  return { results, assumptions };
}
