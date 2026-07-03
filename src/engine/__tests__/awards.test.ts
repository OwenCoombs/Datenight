import { generateAwards } from '@/engine/awards';

import { completedRoundEvents, makeAnswer, makeEvent, makePhoto, makeSession } from './helpers';

describe('generateAwards', () => {
  it('returns at most two awards', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('bonus_accepted', { partner: 'partner_one' }),
      ],
      answers: [
        makeAnswer('round_three_choice', 'sweeter', 'partner_one'),
        makeAnswer('round_three_choice', 'weirder', 'partner_two'),
        makeAnswer('round_two_winner', 'partner_one'),
      ],
      photos: [makePhoto()],
    });
    expect(generateAwards(session).length).toBeLessThanOrEqual(2);
  });

  it('gives NO FEAR for a clean full run', () => {
    const session = makeSession({ events: completedRoundEvents() });
    const awards = generateAwards(session);
    expect(awards.map((a) => a.id)).toContain('no_fear');
  });

  it('never gives NO FEAR when a veto was used', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('mission_vetoed', { partner: 'partner_two' }),
      ],
    });
    const awards = generateAwards(session);
    const noFear = awards.find((a) => a.id === 'no_fear' && a.title === 'NO FEAR');
    expect(noFear).toBeUndefined();
  });

  it('gives THE VETO to the first partner who vetoed', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('mission_vetoed', { partner: 'partner_two' }),
      ],
    });
    const veto = generateAwards(session).find((a) => a.id === 'the_veto');
    expect(veto?.recipient).toBe('partner_two');
  });

  it('gives SECRET SOFTIE to the lone sweeter voter', () => {
    const session = makeSession({
      events: [
        makeEvent('mission_completed', { metadata: { round: 1 } }),
        makeEvent('mission_rerolled'),
        makeEvent('mission_rerolled'),
        makeEvent('mission_vetoed', { partner: 'partner_one' }),
      ],
      answers: [
        makeAnswer('round_three_choice', 'sweeter', 'partner_two'),
        makeAnswer('round_three_choice', 'funnier', 'partner_one'),
      ],
    });
    const softie = generateAwards(session).find((a) => a.id === 'secret_softie');
    expect(softie?.recipient).toBe('partner_two');
  });

  it('never fabricates awards without supporting data', () => {
    const session = makeSession({
      events: [
        makeEvent('mission_completed', { metadata: { round: 1 } }),
        makeEvent('mission_rerolled'),
      ],
    });
    const awards = generateAwards(session);
    // Only the honest group fallback is allowed here.
    expect(awards.length).toBe(1);
    expect(awards[0].recipient).toBe('both');
    expect(awards[0].title).toBe('WE SHOWED UP');
  });

  it('returns no awards for a session with no completed rounds', () => {
    const session = makeSession({ events: [makeEvent('mission_rerolled')] });
    // A no-reroll no-veto empty run would otherwise look "clean" — make
    // sure nothing is invented from zero rounds.
    expect(generateAwards(session)).toEqual([]);
  });

  it('gives THE CHAMPION only from a real round-two winner', () => {
    const withWinner = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('mission_vetoed', { partner: 'partner_one' }),
        makeEvent('mission_rerolled'),
      ],
      answers: [makeAnswer('round_two_winner', 'partner_two')],
    });
    const ids = generateAwards(withWinner).map((a) => a.id);
    expect(ids).toContain('the_champion');

    const nobody = makeSession({
      events: completedRoundEvents(),
      answers: [makeAnswer('round_two_winner', 'nobody')],
    });
    const champion = generateAwards(nobody).find((a) => a.id === 'the_champion');
    expect(champion).toBeUndefined();
  });
});
