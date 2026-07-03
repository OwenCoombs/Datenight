import {
  fallbackMission,
  roundOneMissions,
  roundTwoMissions,
} from '@/content/experiences/noPlanDate';
import { getEligibleMissions, SessionContext } from '@/engine/eligibility';
import { DateSession, Mission } from '@/types/date';
import { pickRandom } from '@/utils/random';

export function sessionToContext(session: DateSession): SessionContext {
  return {
    transportMode: session.transportMode,
    budgetOption: session.budgetOption,
    blockedBoundaries: session.blockedBoundaries,
    blockedCategories: session.blockedCategories,
    locationContext: session.locationContext,
  };
}

/**
 * Pick a mission for a pool round (1 or 2), excluding missions already
 * seen this session (rerolled, vetoed, or completed). Falls back to the
 * guaranteed-safe "Your Move" mission so the app never dead-ends.
 */
export function pickMission(
  round: 1 | 2,
  session: DateSession,
  excludeIds: string[] = [],
): Mission {
  const pool = round === 1 ? roundOneMissions : roundTwoMissions;
  const seen = new Set([
    ...excludeIds,
    ...session.skippedMissionIds,
    ...session.completedMissionIds,
  ]);

  const eligible = getEligibleMissions(pool, sessionToContext(session)).filter(
    (mission) => !seen.has(mission.id),
  );

  if (eligible.length === 0) {
    return fallbackMission;
  }

  return pickRandom(eligible);
}
