import { combineRoundThreeChoices, pickRoundFourEnding } from '@/engine/branching';
import { RoundThreeChoice } from '@/types/date';

import { makeAnswer, makePhoto, makeSession } from './helpers';

describe('combineRoundThreeChoices', () => {
  const cases: [RoundThreeChoice, RoundThreeChoice, string][] = [
    ['funnier', 'funnier', 'funny_funny'],
    ['sweeter', 'sweeter', 'sweet_sweet'],
    ['weirder', 'weirder', 'weird_weird'],
    ['funnier', 'sweeter', 'funny_sweet'],
    ['funnier', 'weirder', 'funny_weird'],
    ['sweeter', 'weirder', 'sweet_weird'],
  ];

  it.each(cases)('%s + %s → %s', (a, b, expected) => {
    expect(combineRoundThreeChoices(a, b)).toBe(expected);
  });

  it.each(cases)('order does not matter: %s + %s', (a, b, expected) => {
    expect(combineRoundThreeChoices(b, a)).toBe(expected);
    expect(combineRoundThreeChoices(a, b)).toBe(combineRoundThreeChoices(b, a));
  });
});

describe('pickRoundFourEnding', () => {
  it('picks One Last Photo with fewer than two photos and photography allowed', () => {
    const session = makeSession({ photos: [makePhoto()] });
    expect(pickRoundFourEnding(session)).toBe('one_last_photo');
  });

  it('never picks One Last Photo when photography is blocked', () => {
    const session = makeSession({
      photos: [],
      blockedBoundaries: ['being_photographed'],
    });
    expect(pickRoundFourEnding(session)).not.toBe('one_last_photo');
  });

  it('picks Future Pick when both partners made the same round-three choice', () => {
    const session = makeSession({
      photos: [makePhoto(), makePhoto()],
      answers: [
        makeAnswer('round_three_choice', 'sweeter', 'partner_one'),
        makeAnswer('round_three_choice', 'sweeter', 'partner_two'),
      ],
    });
    expect(pickRoundFourEnding(session)).toBe('future_pick');
  });

  it('picks Last Song when choices differ and photos are plentiful', () => {
    const session = makeSession({
      photos: [makePhoto(), makePhoto()],
      answers: [
        makeAnswer('round_three_choice', 'funnier', 'partner_one'),
        makeAnswer('round_three_choice', 'weirder', 'partner_two'),
      ],
    });
    expect(pickRoundFourEnding(session)).toBe('last_song');
  });
});
