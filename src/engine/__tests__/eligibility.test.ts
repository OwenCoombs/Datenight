import {
  roundOneMissions,
  roundTwoMissions,
  roundThreeMissions,
} from '@/content/experiences/noPlanDate';
import { resolveRoundThreeMission } from '@/engine/branching';
import { getEligibleMissions, isMissionEligible } from '@/engine/eligibility';

import { makeContext } from './helpers';

describe('getEligibleMissions', () => {
  it('never returns driving-only missions while walking', () => {
    const eligible = getEligibleMissions(
      roundOneMissions,
      makeContext({ transportMode: 'walking' }),
    );
    expect(eligible.map((m) => m.id)).toEqual(['r1_new_direction_walk']);
  });

  it('never returns the walking mission while driving', () => {
    const eligible = getEligibleMissions(
      roundOneMissions,
      makeContext({ transportMode: 'driving' }),
    );
    expect(eligible.length).toBe(3);
    expect(eligible.every((m) => m.id !== 'r1_new_direction_walk')).toBe(true);
  });

  it('excludes the purchase mission when buying things is blocked', () => {
    const context = makeContext({
      locationContext: 'store',
      blockedBoundaries: ['buying_things'],
    });
    const eligible = getEligibleMissions(roundTwoMissions, context);
    expect(eligible.every((m) => m.id !== 'r2_five_dollar_read')).toBe(true);
  });

  it('includes the purchase mission when buying is allowed at a store', () => {
    const context = makeContext({ locationContext: 'store' });
    const eligible = getEligibleMissions(roundTwoMissions, context);
    expect(eligible.map((m) => m.id)).toContain('r2_five_dollar_read');
  });

  it('excludes the food mission when food is blocked', () => {
    const context = makeContext({
      locationContext: 'food_drink',
      blockedBoundaries: ['food'],
    });
    const eligible = getEligibleMissions(roundTwoMissions, context);
    expect(eligible.every((m) => m.id !== 'r2_first_yes')).toBe(true);
  });

  it('excludes missions in vetoed categories', () => {
    const context = makeContext({
      locationContext: 'none',
      blockedCategories: ['exploration'],
    });
    const eligible = getEligibleMissions(roundTwoMissions, context);
    expect(eligible.every((m) => m.category !== 'exploration')).toBe(true);
  });

  it('requires a location context for context-bound missions', () => {
    const eligible = getEligibleMissions(
      roundTwoMissions,
      makeContext({ locationContext: null }),
    );
    expect(eligible).toEqual([]);
  });
});

describe('stranger and photo boundaries', () => {
  it('stranger mission is ineligible when talking to strangers is blocked', () => {
    const mission = roundThreeMissions.weird_weird.mission;
    expect(
      isMissionEligible(mission, makeContext({ blockedBoundaries: ['talking_to_strangers'] })),
    ).toBe(false);
  });

  it("weird+weird falls back to Fate's Choice when strangers are blocked", () => {
    const resolved = resolveRoundThreeMission(
      'weird_weird',
      makeContext({ blockedBoundaries: ['talking_to_strangers'] }),
    );
    expect(resolved.id).toBe('r3_fates_choice');
  });

  it('photo mission falls back when photography is blocked', () => {
    const resolved = resolveRoundThreeMission(
      'funny_funny',
      makeContext({ blockedBoundaries: ['being_photographed'] }),
    );
    expect(resolved.id).toBe('r3_terrible_movie');
  });

  it('photo mission is used when photography is allowed', () => {
    const resolved = resolveRoundThreeMission('funny_funny', makeContext());
    expect(resolved.id).toBe('r3_terrible_photo');
  });
});
