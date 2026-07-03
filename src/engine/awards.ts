import { countCompletedRounds, TOTAL_ROUNDS } from '@/engine/scoring';
import { Award, DateSession, Partner } from '@/types/date';

/**
 * Generate up to two awards, every one backed by actual session data.
 * If there is no individual evidence, fall back to one group award.
 */
export function generateAwards(session: DateSession): Award[] {
  const candidates: Award[] = [];

  const vetoEvents = session.events.filter((event) => event.type === 'mission_vetoed');
  const rerollEvents = session.events.filter(
    (event) => event.type === 'mission_rerolled',
  );
  const roundsCompleted = countCompletedRounds(session);

  // NO FEAR — group award for a clean run.
  if (
    vetoEvents.length === 0 &&
    rerollEvents.length === 0 &&
    roundsCompleted >= TOTAL_ROUNDS
  ) {
    candidates.push({
      id: 'no_fear',
      title: 'NO FEAR',
      description: 'No vetoes. No rerolls. Every round completed.',
      recipient: 'both',
    });
  }

  // THE VETO — first person to use a veto.
  const firstVeto = vetoEvents.find(
    (event) => event.partner === 'partner_one' || event.partner === 'partner_two',
  );
  if (firstVeto) {
    candidates.push({
      id: 'the_veto',
      title: 'THE VETO',
      description: 'Knew exactly what tonight was not going to be.',
      recipient: firstVeto.partner as Partner,
    });
  }

  // Round Three choices.
  const r3Choices = session.answers.filter(
    (answer) => answer.key === 'round_three_choice',
  );
  const sweeterChoosers = r3Choices.filter((answer) => answer.value === 'sweeter');
  const weirderChoosers = r3Choices.filter((answer) => answer.value === 'weirder');

  // SECRET SOFTIE — prioritized when exactly one person chose sweeter.
  if (sweeterChoosers.length === 1 && sweeterChoosers[0].partner) {
    candidates.push({
      id: 'secret_softie',
      title: 'SECRET SOFTIE',
      description: 'Quietly voted to make the night sweeter.',
      recipient: sweeterChoosers[0].partner,
    });
  } else if (sweeterChoosers.length === 2) {
    candidates.push({
      id: 'secret_softie',
      title: 'SECRET SOFTIE',
      description: 'Both voted to make the night sweeter.',
      recipient: 'both',
    });
  }

  // BAD INFLUENCE — chose weirder.
  if (weirderChoosers.length === 1 && weirderChoosers[0].partner) {
    candidates.push({
      id: 'bad_influence',
      title: 'BAD INFLUENCE',
      description: 'Voted to make the night weirder. It worked.',
      recipient: weirderChoosers[0].partner,
    });
  } else if (weirderChoosers.length === 2) {
    candidates.push({
      id: 'bad_influence',
      title: 'BAD INFLUENCE',
      description: 'Both of you voted for weirder. Concerning. Impressive.',
      recipient: 'both',
    });
  }

  // CHAOS AGENT — accepted a bonus challenge.
  const bonusEvents = session.events.filter((event) => event.type === 'bonus_accepted');
  const partnerBonus = bonusEvents.find(
    (event) => event.partner === 'partner_one' || event.partner === 'partner_two',
  );
  if (partnerBonus) {
    candidates.push({
      id: 'chaos_agent',
      title: 'CHAOS AGENT',
      description: 'Said yes to the most chaotic option available.',
      recipient: partnerBonus.partner as Partner,
    });
  } else if (bonusEvents.length > 0) {
    candidates.push({
      id: 'chaos_agent',
      title: 'CHAOS AGENT',
      description: 'Said yes to the most chaotic option available.',
      recipient: 'both',
    });
  }

  // THE CHAMPION — winner of Round Two.
  const r2Winner = session.answers.find((answer) => answer.key === 'round_two_winner');
  if (r2Winner && (r2Winner.value === 'partner_one' || r2Winner.value === 'partner_two')) {
    candidates.push({
      id: 'the_champion',
      title: 'THE CHAMPION',
      description: 'Undisputed winner of Round Two.',
      recipient: r2Winner.value,
    });
  }

  // LOST ON PURPOSE — passenger during a successful driving detour.
  const detourSuccess = session.answers.find(
    (answer) =>
      answer.key === 'round_one_result' &&
      (answer.value === 'found_something' || answer.value === 'stupid_but_yes'),
  );
  if (session.transportMode === 'driving' && detourSuccess && session.passengerName) {
    const passenger: Partner =
      session.passengerName === session.partnerOneName ? 'partner_one' : 'partner_two';
    candidates.push({
      id: 'lost_on_purpose',
      title: 'LOST ON PURPOSE',
      description: 'Navigated the Detour to somewhere genuinely new.',
      recipient: passenger,
    });
  }

  // CREATIVE DIRECTOR — completed a photo-based round with a photo to show.
  const photoMission = session.events.find(
    (event) =>
      event.type === 'mission_completed' &&
      typeof event.missionId === 'string' &&
      (event.missionId.includes('photo') || event.missionId.includes('recreation')),
  );
  if (photoMission && session.photos.length > 0) {
    candidates.push({
      id: 'creative_director',
      title: 'CREATIVE DIRECTOR',
      description: 'Turned tonight into something worth framing.',
      recipient: 'both',
    });
  }

  const unique = dedupeById(candidates);
  const top = unique.slice(0, 2);

  // Guarantee at least one honest group award for any finished date.
  if (top.length === 0 && roundsCompleted > 0) {
    top.push({
      id: 'no_fear',
      title: 'WE SHOWED UP',
      description: `Played ${roundsCompleted} round${roundsCompleted === 1 ? '' : 's'} with no plan at all.`,
      recipient: 'both',
    });
  }

  return top;
}

function dedupeById(awards: Award[]): Award[] {
  const seen = new Set<string>();
  return awards.filter((award) => {
    if (seen.has(award.id)) return false;
    seen.add(award.id);
    return true;
  });
}
