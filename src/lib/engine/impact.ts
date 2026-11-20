import type {
  ActionContext,
  ActionImpactResult,
  CommunityTotalsResult,
  PledgeAction,
  PledgeActionType,
} from '../../types/index.js';
import { PLEDGE_IMPACTS } from '../constants.js';

/**
 * Estimate daily impact of a single pledge action.
 */
export function actionImpact(
  action: PledgeActionType,
  _ctx: ActionContext,
): ActionImpactResult {
  const assumptions: string[] = ['Estimates based on DEFRA-derived factors (UNVERIFIED)'];
  const impact = PLEDGE_IMPACTS[action];
  if (!impact) {
    assumptions.push(`Unknown action "${action}"; zero impact assumed`);
    return { co2eSavedKg: 0, pm25ReducedUg: 0, assumptions };
  }
  return {
    co2eSavedKg: impact.co2eKgPerDay,
    pm25ReducedUg: impact.pm25UgPerDay,
    assumptions,
  };
}

/**
 * Aggregate community pledge impacts.
 */
export function communityTotals(
  pledges: readonly PledgeAction[],
): CommunityTotalsResult {
  const assumptions: string[] = ['Linear scaling of per-pledge impacts'];
  let totalCo2e = 0;
  let totalPm25 = 0;
  let pledgeCount = 0;

  for (const pledge of pledges) {
    const impact = PLEDGE_IMPACTS[pledge.type];
    if (impact) {
      totalCo2e += impact.co2eKgPerDay * pledge.count;
      totalPm25 += impact.pm25UgPerDay * pledge.count;
      pledgeCount += pledge.count;
    }
  }
  return {
    totalCo2eSavedKg: totalCo2e,
    totalPm25ReducedUg: totalPm25,
    pledgeCount,
    assumptions,
  };
}
