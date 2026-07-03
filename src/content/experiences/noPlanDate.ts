import { Mission, RoundThreeCombo } from '@/types/date';

/**
 * All content for The No-Plan Date lives here, separate from the UI.
 * The engine picks eligible missions; the play screen renders them.
 */

// ---------------------------------------------------------------------------
// Round One — THE DETOUR
// ---------------------------------------------------------------------------

export const roundOneMissions: Mission[] = [
  {
    id: 'r1_three_turn_rule',
    round: 1,
    category: 'navigation',
    kicker: 'THE DETOUR',
    title: 'The Three-Turn Rule',
    body: [
      'The passenger chooses three legal, safe turns.',
      'After the third turn: find the first public place you both genuinely have never visited.',
      "You don't need to go inside yet.",
    ],
    interaction: 'instructions',
    eligibility: { transportModes: ['driving'] },
  },
  {
    id: 'r1_coin_flip_route',
    round: 1,
    category: 'navigation',
    kicker: 'THE DETOUR',
    title: 'The Coin-Flip Route',
    body: [
      'At three safe intersections, flip the coin below.',
      'Heads = left. Tails = right.',
      'If a direction is unsafe, illegal, inaccessible, or unreasonable — ignore it and continue safely.',
    ],
    interaction: 'coin_flip',
    eligibility: { transportModes: ['driving'] },
  },
  {
    id: 'r1_first_place_wins',
    round: 1,
    category: 'navigation',
    kicker: 'THE DETOUR',
    title: 'First Place Wins',
    body: [
      'The app just picked a category.',
      'The first reasonable place that fits the category wins.',
      'No checking reviews.',
    ],
    interaction: 'category_draw',
    eligibility: { transportModes: ['driving'] },
  },
  {
    id: 'r1_new_direction_walk',
    round: 1,
    category: 'exploration',
    kicker: 'THE DETOUR',
    title: 'Pick a Direction Neither of You Normally Takes',
    body: ['Walk for 10 minutes.'],
    interaction: 'walk_then_find',
    timerSeconds: 10 * 60,
    eligibility: { transportModes: ['walking'] },
  },
];

/** Categories drawn for "First Place Wins". */
export const firstPlaceCategories = [
  'Somewhere sweet',
  'Somewhere weird',
  'Somewhere peaceful',
  'Somewhere competitive',
  'Somewhere neither of you understands',
] as const;

/** Second beat of the walking detour. */
export const walkFindPrompt = {
  title: "Now find one thing you've never noticed before.",
  examples: [
    'a store',
    'a mural',
    'a view',
    'a restaurant',
    'an unusual building',
    'something completely stupid',
  ],
  timerSeconds: 5 * 60,
};

// ---------------------------------------------------------------------------
// Round Two — branches on where the couple ended up
// ---------------------------------------------------------------------------

export const roundTwoMissions: Mission[] = [
  {
    id: 'r2_first_yes',
    round: 2,
    category: 'food_challenge',
    kicker: 'ROUND TWO',
    title: 'The First Yes',
    body: [
      'You cannot order your usual thing.',
      'Each person chooses something they have never tried.',
      'You are allowed to hate it. You are not allowed to change your mind before trying it.',
    ],
    interaction: 'bonus_offer',
    eligibility: { requiredContext: ['food_drink'], blockedByBoundaries: ['food'] },
  },
  {
    id: 'r2_five_dollar_read',
    round: 2,
    category: 'shopping',
    kicker: 'ROUND TWO',
    title: 'The $5 Read',
    body: [
      'Separate. Each person has ten minutes and up to $5.',
      'Find one thing that answers: "This is somehow you."',
      'Do not explain your choice until the timer ends.',
    ],
    interaction: 'solo_timer_then_ratings',
    timerSeconds: 10 * 60,
    eligibility: { requiredContext: ['store'], blockedByBoundaries: ['buying_things'] },
  },
  {
    id: 'r2_partner_rule',
    round: 2,
    category: 'game',
    kicker: 'ROUND TWO',
    title: 'Your Partner Chooses Your Rule',
    body: [
      'Each of you gets a rule for this activity — drawn by the app, delivered by your partner.',
      'The rule stays on until the activity ends.',
    ],
    interaction: 'modifier_draw',
    eligibility: { requiredContext: ['activity'] },
  },
  {
    id: 'r2_five_minute_hunt',
    round: 2,
    category: 'exploration',
    kicker: 'ROUND TWO',
    title: 'The Five-Minute Hunt',
    body: [
      'The app picked a hunt. Each partner chooses an entry.',
      'You have five minutes.',
    ],
    interaction: 'hunt_draw',
    timerSeconds: 5 * 60,
    eligibility: { requiredContext: ['none'] },
  },
];

/** Harmless activity modifiers. `boundary` marks conflicts to filter out. */
export const activityModifiers: { text: string; boundary?: 'physical_activity' }[] = [
  { text: 'Use your non-dominant hand', boundary: 'physical_activity' },
  { text: 'Celebrate every point like you won a championship' },
  { text: 'Compliment your opponent after every loss' },
  { text: 'The loser chooses the next song' },
  { text: 'Give yourself an absurd athlete introduction' },
];

export const huntCategories = [
  'Funniest sign',
  'Worst decoration',
  'Object that looks like your partner',
  'Weirdest free thing nearby',
  'Best accidental album cover',
] as const;

export const roundTwoBonus = {
  label: '+10 CHAOS',
  text: 'Let your partner choose for you.',
};

// ---------------------------------------------------------------------------
// Round Three — THE LOCKED CHOICE
// ---------------------------------------------------------------------------

interface RoundThreeContent {
  mission: Mission;
  /** Replacement when the primary conflicts with a boundary. */
  fallback?: Mission;
}

export const roundThreeMissions: Record<RoundThreeCombo, RoundThreeContent> = {
  funny_funny: {
    mission: {
      id: 'r3_terrible_photo',
      round: 3,
      category: 'photo',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Terrible Photo',
      body: [
        'You have five minutes. Create the worst fake album cover possible.',
        'One photo. No deleting it after submission. Both people must approve.',
        'Give the fake album a name.',
      ],
      interaction: 'photo_creation',
      timerSeconds: 5 * 60,
      eligibility: { blockedByBoundaries: ['being_photographed'] },
    },
    fallback: {
      id: 'r3_terrible_movie',
      round: 3,
      category: 'performance',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Terrible Movie',
      body: [
        'Create a fake movie about tonight:',
        'A fake movie title. A one-sentence plot. Who plays each of you.',
      ],
      interaction: 'instructions',
    },
  },
  sweet_sweet: {
    mission: {
      id: 'r3_thing_i_dont_say',
      round: 3,
      category: 'sentimental',
      kicker: 'THE LOCKED CHOICE',
      title: "The Thing I Don't Say Enough",
      body: [
        'Take turns completing:',
        '"One thing I genuinely appreciate about you that I probably don\'t say enough is..."',
        'No typing. No proof. No recording. No sharing.',
      ],
      interaction: 'private_moment',
    },
  },
  weird_weird: {
    mission: {
      id: 'r3_strangers_choice',
      round: 3,
      category: 'stranger',
      kicker: 'THE LOCKED CHOICE',
      title: "Stranger's Choice",
      body: [
        'Ask one person:',
        '"We\'re on a date and an app is controlling our night. Pick one: dessert, a walk, or something random."',
        'Their pick decides what happens next.',
      ],
      interaction: 'instructions',
      eligibility: { blockedByBoundaries: ['talking_to_strangers'] },
    },
    fallback: {
      id: 'r3_fates_choice',
      round: 3,
      category: 'game',
      kicker: 'THE LOCKED CHOICE',
      title: "Fate's Choice",
      body: ['Spin the wheel. Fate decides what happens next.'],
      interaction: 'fate_wheel',
    },
  },
  funny_sweet: {
    mission: {
      id: 'r3_bad_recreation',
      round: 3,
      category: 'photo',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Bad Recreation',
      body: [
        'Choose a meaningful photo or memory from your relationship.',
        'Recreate it as badly as possible.',
      ],
      interaction: 'photo_creation',
      eligibility: { blockedByBoundaries: ['being_photographed'] },
    },
    fallback: {
      id: 'r3_retell_memory',
      round: 3,
      category: 'sentimental',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Bad Recreation',
      body: [
        'Choose a meaningful memory from your relationship.',
        "Retell it from the other person's perspective.",
      ],
      interaction: 'instructions',
    },
  },
  sweet_weird: {
    mission: {
      id: 'r3_secret_soundtrack',
      round: 3,
      category: 'music',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Secret Soundtrack',
      body: [
        'Each person secretly picks one song that reminds them of the other.',
        'Play both songs.',
        'No explanations until both finish.',
      ],
      interaction: 'instructions',
    },
  },
  funny_weird: {
    mission: {
      id: 'r3_fake_origin_story',
      round: 3,
      category: 'performance',
      kicker: 'THE LOCKED CHOICE',
      title: 'The Fake Origin Story',
      body: [
        'Find a random object nearby.',
        'Together, create a completely fake story about how that object caused you to meet.',
        'Make it as believable as possible.',
      ],
      interaction: 'instructions',
    },
  },
};

export const fateWheelOptions = [
  'Dessert',
  'Walk',
  'Music',
  'Photo',
  'Mini game',
  'Mystery stop',
] as const;

// ---------------------------------------------------------------------------
// Round Four — THE LAST MOVE
// ---------------------------------------------------------------------------

export const roundFourMissions: Record<'one_last_photo' | 'future_pick' | 'last_song', Mission> = {
  one_last_photo: {
    id: 'r4_one_last_photo',
    round: 4,
    category: 'photo',
    kicker: 'THE LAST MOVE',
    title: 'One Last Photo',
    body: ['Not posed. Not perfect.', 'Take one photo that actually feels like tonight.'],
    interaction: 'photo_creation',
    eligibility: { blockedByBoundaries: ['being_photographed'] },
  },
  future_pick: {
    id: 'r4_future_pick',
    round: 4,
    category: 'game',
    kicker: 'THE LAST MOVE',
    title: 'The Future Pick',
    body: ['Each of you privately answers:', 'What kind of date should we do next?'],
    interaction: 'future_pick',
  },
  last_song: {
    id: 'r4_last_song',
    round: 4,
    category: 'music',
    kicker: 'THE LAST MOVE',
    title: 'The Last Song',
    body: ['Each person secretly chooses one song.', 'Play both. No skipping.'],
    interaction: 'instructions',
  },
};

export const futurePickOptions = [
  'Chill',
  'Fun',
  'Romantic',
  'Wild',
  'Deep',
  'Spontaneous again',
] as const;

// ---------------------------------------------------------------------------
// Fallback — the app never dead-ends
// ---------------------------------------------------------------------------

export const fallbackMission: Mission = {
  id: 'fallback_your_move',
  round: 2,
  category: 'game',
  kicker: 'FALLBACK',
  title: 'Your Move',
  body: ['Pick one:'],
  interaction: 'fallback_menu',
  isFallback: true,
};

export const fallbackMenuOptions = [
  'Take a 10-minute walk',
  'Find dessert',
  'Choose one song each',
  'Play rock-paper-scissors — winner decides the next stop',
] as const;

export const allMissions: Mission[] = [
  ...roundOneMissions,
  ...roundTwoMissions,
  ...Object.values(roundThreeMissions).flatMap((c) =>
    c.fallback ? [c.mission, c.fallback] : [c.mission],
  ),
  ...Object.values(roundFourMissions),
  fallbackMission,
];

export function getMissionById(id: string): Mission | undefined {
  return allMissions.find((m) => m.id === id);
}
