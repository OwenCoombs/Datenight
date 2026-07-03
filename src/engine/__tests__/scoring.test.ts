import { computeSpontaneityScore } from '@/engine/scoring';

import { completedRoundEvents, makeEvent, makePhoto, makeSession } from './helpers';

describe('computeSpontaneityScore', () => {
  it('scores a perfect night at 100', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('private_choice_made', { partner: 'partner_one' }),
        makeEvent('private_choice_made', { partner: 'partner_two' }),
        makeEvent('bonus_accepted', { partner: 'both' }),
        makeEvent('bonus_accepted', { partner: 'both' }),
      ],
      photos: [makePhoto(1), makePhoto(3)],
    });
    // 60 rounds + 10 all four + 5 private + 10 bonuses + 5 photos + 5 no
    // rerolls + 5 no vetoes = 100
    expect(computeSpontaneityScore(session)).toBe(100);
  });

  it('scores an early ending by completed rounds only', () => {
    const session = makeSession({
      events: [
        makeEvent('mission_completed', { metadata: { round: 1 } }),
        makeEvent('mission_completed', { metadata: { round: 2 } }),
      ],
    });
    // 30 rounds + 5 no rerolls + 5 no vetoes
    expect(computeSpontaneityScore(session)).toBe(40);
  });

  it('loses the reroll bonus when a reroll is used', () => {
    const clean = makeSession({ events: completedRoundEvents() });
    const rerolled = makeSession({
      events: [...completedRoundEvents(), makeEvent('mission_rerolled')],
    });
    expect(computeSpontaneityScore(clean) - computeSpontaneityScore(rerolled)).toBe(5);
  });

  it('loses the veto bonus when a veto is used', () => {
    const clean = makeSession({ events: completedRoundEvents() });
    const vetoed = makeSession({
      events: [...completedRoundEvents(), makeEvent('mission_vetoed', { partner: 'partner_one' })],
    });
    expect(computeSpontaneityScore(clean) - computeSpontaneityScore(vetoed)).toBe(5);
  });

  it('does not grant the memory bonus below two photos', () => {
    const one = makeSession({ events: completedRoundEvents(), photos: [makePhoto()] });
    const two = makeSession({
      events: completedRoundEvents(),
      photos: [makePhoto(), makePhoto()],
    });
    expect(computeSpontaneityScore(two) - computeSpontaneityScore(one)).toBe(5);
  });

  it('caps bonus challenge points at 10', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        makeEvent('bonus_accepted'),
        makeEvent('bonus_accepted'),
        makeEvent('bonus_accepted'),
      ],
    });
    // 60 + 10 + 10 bonuses (capped) + 5 + 5 = 90
    expect(computeSpontaneityScore(session)).toBe(90);
  });

  it('never exceeds 100', () => {
    const session = makeSession({
      events: [
        ...completedRoundEvents(),
        ...completedRoundEvents(),
        makeEvent('private_choice_made', { partner: 'partner_one' }),
        makeEvent('private_choice_made', { partner: 'partner_two' }),
        makeEvent('bonus_accepted'),
        makeEvent('bonus_accepted'),
        makeEvent('bonus_accepted'),
      ],
      photos: [makePhoto(), makePhoto(), makePhoto()],
    });
    expect(computeSpontaneityScore(session)).toBeLessThanOrEqual(100);
  });
});
