import {
  BoundaryKey,
  BudgetOption,
  LocationContext,
  Mission,
  MissionCategory,
  TransportMode,
} from '@/types/date';

export interface SessionContext {
  transportMode: TransportMode;
  budgetOption: BudgetOption;
  blockedBoundaries: BoundaryKey[];
  blockedCategories: MissionCategory[];
  locationContext: LocationContext | null;
}

/**
 * Pure eligibility filter. A mission is eligible only when transport,
 * budget, boundaries, vetoed categories, and location context all allow it.
 */
export function getEligibleMissions(
  missions: Mission[],
  context: SessionContext,
): Mission[] {
  return missions.filter((mission) => isMissionEligible(mission, context));
}

export function isMissionEligible(mission: Mission, context: SessionContext): boolean {
  const rules = mission.eligibility;

  if (context.blockedCategories.includes(mission.category)) {
    return false;
  }

  if (!rules) {
    return true;
  }

  if (rules.transportModes && !rules.transportModes.includes(context.transportMode)) {
    return false;
  }

  if (rules.allowedBudgets && !rules.allowedBudgets.includes(context.budgetOption)) {
    return false;
  }

  if (
    rules.blockedByBoundaries?.some((boundary) =>
      context.blockedBoundaries.includes(boundary),
    )
  ) {
    return false;
  }

  if (rules.requiredContext) {
    if (
      context.locationContext === null ||
      !rules.requiredContext.includes(context.locationContext)
    ) {
      return false;
    }
  }

  return true;
}

/** Photography is a boundary the UI checks in several places. */
export function isPhotographyAllowed(blockedBoundaries: BoundaryKey[]): boolean {
  return !blockedBoundaries.includes('being_photographed');
}
