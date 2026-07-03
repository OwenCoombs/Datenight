import {
  roundFourMissions,
  roundThreeMissions,
} from '@/content/experiences/noPlanDate';
import { isMissionEligible, SessionContext } from '@/engine/eligibility';
import {
  DateSession,
  Mission,
  RoundThreeChoice,
  RoundThreeCombo,
} from '@/types/date';

/**
 * Combine the two private Round Three choices into an order-independent
 * combo key: funnier+sweeter === sweeter+funnier.
 */
export function combineRoundThreeChoices(
  a: RoundThreeChoice,
  b: RoundThreeChoice,
): RoundThreeCombo {
  const set = new Set<RoundThreeChoice>([a, b]);
  if (set.size === 1) {
    if (a === 'funnier') return 'funny_funny';
    if (a === 'sweeter') return 'sweet_sweet';
    return 'weird_weird';
  }
  if (set.has('funnier') && set.has('sweeter')) return 'funny_sweet';
  if (set.has('funnier') && set.has('weirder')) return 'funny_weird';
  return 'sweet_weird';
}

/**
 * Resolve the Round Three mission for a combo, falling back to the
 * boundary-safe variant when the primary is ineligible.
 */
export function resolveRoundThreeMission(
  combo: RoundThreeCombo,
  context: SessionContext,
): Mission {
  const content = roundThreeMissions[combo];
  if (isMissionEligible(content.mission, context)) {
    return content.mission;
  }
  if (content.fallback) {
    return content.fallback;
  }
  return content.mission;
}

export type RoundFourEndingId = 'one_last_photo' | 'future_pick' | 'last_song';

/**
 * Deterministic Round Four selection:
 * 1. Fewer than two photos and photography allowed → ONE LAST PHOTO
 * 2. Both partners made the same Round Three choice → THE FUTURE PICK
 * 3. Otherwise → THE LAST SONG
 */
export function pickRoundFourEnding(
  session: Pick<DateSession, 'photos' | 'blockedBoundaries' | 'answers'>,
): RoundFourEndingId {
  const photographyAllowed = !session.blockedBoundaries.includes('being_photographed');
  if (session.photos.length < 2 && photographyAllowed) {
    return 'one_last_photo';
  }

  const p1 = session.answers.find(
    (answer) => answer.key === 'round_three_choice' && answer.partner === 'partner_one',
  );
  const p2 = session.answers.find(
    (answer) => answer.key === 'round_three_choice' && answer.partner === 'partner_two',
  );
  if (p1 && p2 && p1.value === p2.value) {
    return 'future_pick';
  }

  return 'last_song';
}

export function getRoundFourMission(ending: RoundFourEndingId): Mission {
  return roundFourMissions[ending];
}
