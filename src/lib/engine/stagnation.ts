import type { StagnationResult, StagnationSignals } from '../../types/index.js';
import { STAGNATION_THRESHOLDS } from '../constants.js';

/**
 * Heuristic stagnation risk from meteorological signals.
 * Returns Low / Medium / High with a 0–1 score.
 */
export function stagnationRisk(signals: StagnationSignals): StagnationResult {
  const assumptions: string[] = ['Heuristic scoring; not a forecast model'];
  let score = 0;
  const { windLow, windVeryLow, mixingHeightLow, inversionStrong } = STAGNATION_THRESHOLDS;

  // Wind contribution (0 – 0.4)
  if (signals.windSpeed < windVeryLow) {
    score += 0.4;
    assumptions.push(`Wind ${signals.windSpeed} m/s < ${windVeryLow} → +0.4`);
  } else if (signals.windSpeed < windLow) {
    score += 0.2;
    assumptions.push(`Wind ${signals.windSpeed} m/s < ${windLow} → +0.2`);
  }

  // Mixing height contribution (0 – 0.3)
  if (signals.mixingHeight !== undefined && signals.mixingHeight < mixingHeightLow) {
    score += 0.3;
    assumptions.push(`Mixing height ${signals.mixingHeight} m < ${mixingHeightLow} → +0.3`);
  }

  // Inversion contribution (0 – 0.3)
  if (signals.deltaTemp !== undefined && signals.deltaTemp > inversionStrong) {
    score += 0.3;
    assumptions.push(`Inversion ΔT ${signals.deltaTemp} °C > ${inversionStrong} → +0.3`);
  }

  const level = score >= 0.6 ? 'high' : score >= 0.3 ? 'medium' : 'low';
  return { level, score, assumptions };
}
