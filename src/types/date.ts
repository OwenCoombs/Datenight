export type VibeId = 'chill' | 'fun' | 'spontaneous' | 'romantic' | 'wild' | 'deep';

export interface Vibe {
  id: VibeId;
  name: string;
  emoji: string;
  description: string;
  enabled: boolean;
}

export type TimeOption = 'quick' | 'few_hours' | 'free_tonight';

export type BudgetOption =
  | 'basically_nothing'
  | 'keep_it_cheap'
  | 'spend_a_little'
  | 'open_budget';

export type TransportMode = 'driving' | 'walking';

export type BoundaryKey =
  | 'talking_to_strangers'
  | 'buying_things'
  | 'food'
  | 'alcohol'
  | 'physical_activity'
  | 'being_photographed'
  | 'crowded_places'
  | 'outdoor_activities';

export type Partner = 'partner_one' | 'partner_two';

/** What kind of place the couple reports ending up at after the Detour. */
export type LocationContext = 'food_drink' | 'store' | 'activity' | 'none';

/** Round Three private choice. */
export type RoundThreeChoice = 'funnier' | 'sweeter' | 'weirder';

/** Order-independent Round Three combination. */
export type RoundThreeCombo =
  | 'funny_funny'
  | 'sweet_sweet'
  | 'weird_weird'
  | 'funny_sweet'
  | 'funny_weird'
  | 'sweet_weird';

/**
 * Mission categories power the veto option
 * "Avoid this kind of mission tonight".
 */
export type MissionCategory =
  | 'navigation'
  | 'exploration'
  | 'food_challenge'
  | 'shopping'
  | 'performance'
  | 'photo'
  | 'sentimental'
  | 'stranger'
  | 'music'
  | 'game';

export interface MissionEligibility {
  transportModes?: TransportMode[];
  allowedBudgets?: BudgetOption[];
  blockedByBoundaries?: BoundaryKey[];
  requiredContext?: LocationContext[];
}

/**
 * How the play screen renders the mission's interactive part.
 * Every kind maps to a real implemented interaction — no placeholders.
 */
export type MissionInteraction =
  | 'instructions'
  | 'coin_flip'
  | 'walk_then_find'
  | 'category_draw'
  | 'bonus_offer'
  | 'solo_timer_then_ratings'
  | 'modifier_draw'
  | 'hunt_draw'
  | 'private_moment'
  | 'fate_wheel'
  | 'photo_creation'
  | 'future_pick'
  | 'fallback_menu';

export interface Mission {
  id: string;
  round: 1 | 2 | 3 | 4;
  category: MissionCategory;
  title: string;
  /** Short kicker shown above the title, e.g. "THE DETOUR". */
  kicker?: string;
  /** Instruction paragraphs, revealed as the mission body. */
  body: string[];
  interaction: MissionInteraction;
  eligibility?: MissionEligibility;
  /** Optional built-in timer length, in seconds. */
  timerSeconds?: number;
  /** True when this mission is the guaranteed safe fallback. */
  isFallback?: boolean;
}

export interface PhotoMemory {
  id: string;
  sessionId: string;
  uri: string;
  round: number;
  createdAt: string;
}

export interface SessionAnswer {
  id: string;
  key: string;
  value: string;
  partner?: Partner;
  round: number;
  createdAt: string;
}

export type SessionEventType =
  | 'session_started'
  | 'mission_started'
  | 'mission_completed'
  | 'mission_failed'
  | 'mission_rerolled'
  | 'mission_vetoed'
  | 'photo_added'
  | 'bonus_accepted'
  | 'private_choice_made'
  | 'session_completed'
  | 'session_ended_early';

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: SessionEventType;
  partner?: Partner | 'both';
  missionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type AwardId =
  | 'the_veto'
  | 'secret_softie'
  | 'bad_influence'
  | 'chaos_agent'
  | 'creative_director'
  | 'lost_on_purpose'
  | 'the_champion'
  | 'no_fear';

export interface Award {
  id: AwardId;
  title: string;
  description: string;
  recipient: Partner | 'both';
}

export type SessionStatus = 'setup' | 'ready' | 'active' | 'completed' | 'ended_early';

/**
 * Fine-grained position inside the playable date, so the app can resume
 * exactly where the couple left off after being closed.
 */
export type SessionStage =
  | 'r1_handoff'
  | 'r1_mission'
  | 'r1_result'
  | 'r1_photo'
  | 'r1_complete'
  | 'r2_context'
  | 'r2_mission'
  | 'r2_winner'
  | 'r2_complete'
  | 'r3_private_choice'
  | 'r3_mission'
  | 'r3_complete'
  | 'r4_mission'
  | 'r4_complete'
  | 'finished';

export interface DateSession {
  id: string;

  experienceId: 'no_plan_date';

  status: SessionStatus;

  startedAt: string | null;
  completedAt: string | null;

  partnerOneName: string;
  partnerTwoName: string;

  timeOption: TimeOption;
  budgetOption: BudgetOption;
  transportMode: TransportMode;

  driverName?: string;
  passengerName?: string;

  blockedBoundaries: BoundaryKey[];

  /** Mission categories vetoed out for the rest of the night. */
  blockedCategories: MissionCategory[];

  currentRound: number;
  currentMissionId: string | null;
  stage: SessionStage;

  /** Where the couple reported ending up after Round One. */
  locationContext: LocationContext | null;

  completedMissionIds: string[];
  skippedMissionIds: string[];

  rerollsRemaining: number;

  partnerOneVetoRemaining: number;
  partnerTwoVetoRemaining: number;

  /** Persistent timer state — wall-clock based so it survives backgrounding. */
  timerStartedAt: string | null;
  timerEndsAt: string | null;

  photos: PhotoMemory[];
  answers: SessionAnswer[];
  events: SessionEvent[];

  score?: number;
  awards?: Award[];
}
