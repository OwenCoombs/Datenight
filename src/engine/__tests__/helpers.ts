import { SessionContext } from '@/engine/eligibility';
import {
  DateSession,
  SessionEvent,
  SessionEventType,
  SessionAnswer,
  Partner,
  PhotoMemory,
} from '@/types/date';

let counter = 0;
const nextId = () => `test-${counter++}`;

export function makeContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    transportMode: 'walking',
    budgetOption: 'keep_it_cheap',
    blockedBoundaries: [],
    blockedCategories: [],
    locationContext: null,
    ...overrides,
  };
}

export function makeSession(overrides: Partial<DateSession> = {}): DateSession {
  return {
    id: 'session-1',
    experienceId: 'no_plan_date',
    status: 'active',
    startedAt: '2026-01-01T20:00:00.000Z',
    completedAt: null,
    partnerOneName: 'Alex',
    partnerTwoName: 'Sam',
    timeOption: 'few_hours',
    budgetOption: 'keep_it_cheap',
    transportMode: 'walking',
    blockedBoundaries: [],
    blockedCategories: [],
    currentRound: 1,
    currentMissionId: null,
    stage: 'r1_mission',
    locationContext: null,
    completedMissionIds: [],
    skippedMissionIds: [],
    rerollsRemaining: 2,
    partnerOneVetoRemaining: 1,
    partnerTwoVetoRemaining: 1,
    timerStartedAt: null,
    timerEndsAt: null,
    photos: [],
    answers: [],
    events: [],
    ...overrides,
  };
}

export function makeEvent(
  type: SessionEventType,
  extra: Partial<SessionEvent> = {},
): SessionEvent {
  return {
    id: nextId(),
    sessionId: 'session-1',
    type,
    createdAt: '2026-01-01T21:00:00.000Z',
    ...extra,
  };
}

export function makeAnswer(
  key: string,
  value: string,
  partner?: Partner,
): SessionAnswer {
  return {
    id: nextId(),
    key,
    value,
    partner,
    round: 1,
    createdAt: '2026-01-01T21:00:00.000Z',
  };
}

export function makePhoto(round = 1): PhotoMemory {
  return {
    id: nextId(),
    sessionId: 'session-1',
    uri: 'file:///photo.jpg',
    round,
    createdAt: '2026-01-01T21:00:00.000Z',
  };
}

/** Events for a full four-round completion. */
export function completedRoundEvents(): SessionEvent[] {
  return [1, 2, 3, 4].map((round) =>
    makeEvent('mission_completed', { missionId: `m${round}`, metadata: { round } }),
  );
}
