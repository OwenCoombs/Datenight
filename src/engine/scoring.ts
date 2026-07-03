import { DateSession } from '@/types/date';

export const INITIAL_REROLLS = 2;
export const INITIAL_VETOES_PER_PARTNER = 1;
export const TOTAL_ROUNDS = 4;

/**
 * Spontaneity Score, 0–100.
 *
 *   15 points per completed round (max 60)
 *   +10 completed all four rounds
 *   +5  both partners completed private choices
 *   +10 max for accepted bonus challenges (5 each)
 *   +5  captured at least two memories
 *   +5  used zero rerolls
 *   +5  used zero vetoes
 */
export function computeSpontaneityScore(session: DateSession): number {
  let score = 0;

  const roundsCompleted = countCompletedRounds(session);
  score += Math.min(roundsCompleted, TOTAL_ROUNDS) * 15;

  if (roundsCompleted >= TOTAL_ROUNDS) {
    score += 10;
  }

  const privateChoices = session.events.filter(
    (event) => event.type === 'private_choice_made',
  );
  const p1Chose = privateChoices.some((event) => event.partner === 'partner_one');
  const p2Chose = privateChoices.some((event) => event.partner === 'partner_two');
  if (p1Chose && p2Chose) {
    score += 5;
  }

  const bonusesAccepted = session.events.filter(
    (event) => event.type === 'bonus_accepted',
  ).length;
  score += Math.min(bonusesAccepted * 5, 10);

  if (session.photos.length >= 2) {
    score += 5;
  }

  const rerollsUsed = session.events.filter(
    (event) => event.type === 'mission_rerolled',
  ).length;
  if (rerollsUsed === 0) {
    score += 5;
  }

  const vetoesUsed = session.events.filter(
    (event) => event.type === 'mission_vetoed',
  ).length;
  if (vetoesUsed === 0) {
    score += 5;
  }

  return Math.min(score, 100);
}

export function countCompletedRounds(session: DateSession): number {
  const rounds = new Set<number>();
  for (const event of session.events) {
    if (event.type === 'mission_completed' && typeof event.metadata?.round === 'number') {
      rounds.add(event.metadata.round);
    }
  }
  return rounds.size;
}

export function countRerollsUsed(session: DateSession): number {
  return session.events.filter((event) => event.type === 'mission_rerolled').length;
}

export function countVetoesUsed(session: DateSession): number {
  return session.events.filter((event) => event.type === 'mission_vetoed').length;
}
