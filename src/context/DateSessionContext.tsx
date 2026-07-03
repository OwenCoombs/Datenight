import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getMissionById } from '@/content/experiences/noPlanDate';
import { pickMission } from '@/engine/dateEngine';
import { generateAwards } from '@/engine/awards';
import { computeSpontaneityScore, INITIAL_REROLLS, INITIAL_VETOES_PER_PARTNER } from '@/engine/scoring';
import * as sessionRepo from '@/db/sessionRepository';
import {
  BoundaryKey,
  BudgetOption,
  DateSession,
  Mission,
  MissionCategory,
  Partner,
  PhotoMemory,
  SessionEvent,
  SessionEventType,
  SessionStage,
  LocationContext,
  TimeOption,
  TransportMode,
} from '@/types/date';
import { createId } from '@/utils/ids';
import { persistPhoto } from '@/utils/media';
import { nowIso } from '@/utils/time';

export interface NewSessionConfig {
  partnerOneName: string;
  partnerTwoName: string;
  timeOption: TimeOption;
  budgetOption: BudgetOption;
  transportMode: TransportMode;
  driverName?: string;
  passengerName?: string;
  blockedBoundaries: BoundaryKey[];
}

interface DateSessionContextValue {
  session: DateSession | null;
  /** Load the persisted active session into memory (resume support). */
  loadActiveSession: () => DateSession | null;
  loadSessionById: (id: string) => DateSession | null;
  createSession: (config: NewSessionConfig) => DateSession;
  /** Kick off Round One when the countdown finishes. */
  startDate: () => void;
  setStage: (stage: SessionStage) => void;
  advanceToRound: (round: number, stage: SessionStage) => void;
  setMission: (mission: Mission) => void;
  pickAndSetMission: (round: 1 | 2) => Mission;
  rerollCurrentMission: () => Mission | null;
  vetoCurrentMission: (partner: Partner, avoidCategory: boolean) => Mission | null;
  completeCurrentMission: (metadata?: Record<string, unknown>) => void;
  recordAnswer: (key: string, value: string, partner?: Partner) => void;
  recordEvent: (
    type: SessionEventType,
    extra?: { partner?: Partner | 'both'; missionId?: string; metadata?: Record<string, unknown> },
  ) => void;
  setLocationContext: (context: LocationContext) => void;
  startTimer: (seconds: number) => void;
  clearTimer: () => void;
  addPhotoFromUri: (tempUri: string) => PhotoMemory | null;
  finishSession: (endedEarly: boolean) => DateSession | null;
  clearSession: () => void;
}

const DateSessionContext = createContext<DateSessionContextValue | null>(null);

export function DateSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<DateSession | null>(null);
  // Ref mirrors state so mutations are synchronous and side effects
  // (SQLite writes) run exactly once, outside React's state updater.
  const sessionRef = useRef<DateSession | null>(null);

  const replaceSession = useCallback((next: DateSession | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  /** Apply a mutation, persist it, and update React state atomically. */
  const mutate = useCallback(
    (updater: (current: DateSession) => DateSession): DateSession | null => {
      const current = sessionRef.current;
      if (!current) return null;
      const next = updater(current);
      if (next !== current) {
        sessionRepo.saveSession(next);
      }
      replaceSession(next);
      return next;
    },
    [replaceSession],
  );

  const buildEvent = useCallback(
    (
      sessionId: string,
      type: SessionEventType,
      extra?: {
        partner?: Partner | 'both';
        missionId?: string;
        metadata?: Record<string, unknown>;
      },
    ): SessionEvent => ({
      id: createId(),
      sessionId,
      type,
      partner: extra?.partner,
      missionId: extra?.missionId,
      metadata: extra?.metadata,
      createdAt: nowIso(),
    }),
    [],
  );

  const appendEventTo = useCallback(
    (
      current: DateSession,
      type: SessionEventType,
      extra?: {
        partner?: Partner | 'both';
        missionId?: string;
        metadata?: Record<string, unknown>;
      },
    ): DateSession => {
      const event = buildEvent(current.id, type, extra);
      sessionRepo.appendEvent(event);
      return { ...current, events: [...current.events, event] };
    },
    [buildEvent],
  );

  const loadActiveSession = useCallback((): DateSession | null => {
    const active = sessionRepo.getActiveSession();
    replaceSession(active);
    return active;
  }, [replaceSession]);

  const loadSessionById = useCallback(
    (id: string): DateSession | null => {
      const found = sessionRepo.getSessionById(id);
      if (found) replaceSession(found);
      return found;
    },
    [replaceSession],
  );

  const createSession = useCallback((config: NewSessionConfig): DateSession => {
    const fresh: DateSession = {
      id: createId(),
      experienceId: 'no_plan_date',
      status: 'ready',
      startedAt: null,
      completedAt: null,
      partnerOneName: config.partnerOneName,
      partnerTwoName: config.partnerTwoName,
      timeOption: config.timeOption,
      budgetOption: config.budgetOption,
      transportMode: config.transportMode,
      driverName: config.driverName,
      passengerName: config.passengerName,
      blockedBoundaries: config.blockedBoundaries,
      blockedCategories: [],
      currentRound: 1,
      currentMissionId: null,
      stage: config.transportMode === 'driving' ? 'r1_handoff' : 'r1_mission',
      locationContext: null,
      completedMissionIds: [],
      skippedMissionIds: [],
      rerollsRemaining: INITIAL_REROLLS,
      partnerOneVetoRemaining: INITIAL_VETOES_PER_PARTNER,
      partnerTwoVetoRemaining: INITIAL_VETOES_PER_PARTNER,
      timerStartedAt: null,
      timerEndsAt: null,
      photos: [],
      answers: [],
      events: [],
    };
    sessionRepo.saveSession(fresh);
    replaceSession(fresh);
    return fresh;
  }, [replaceSession]);

  const startDate = useCallback(() => {
    mutate((current) => {
      if (current.status === 'active') return current;
      let next: DateSession = {
        ...current,
        status: 'active',
        startedAt: nowIso(),
      };
      next = appendEventTo(next, 'session_started');

      const mission = pickMission(1, next);
      next = { ...next, currentMissionId: mission.id };
      next = appendEventTo(next, 'mission_started', { missionId: mission.id });
      return next;
    });
  }, [mutate, appendEventTo]);

  const setStage = useCallback(
    (stage: SessionStage) => {
      mutate((current) => ({ ...current, stage }));
    },
    [mutate],
  );

  const advanceToRound = useCallback(
    (round: number, stage: SessionStage) => {
      mutate((current) => ({
        ...current,
        currentRound: round,
        stage,
        currentMissionId: null,
        timerStartedAt: null,
        timerEndsAt: null,
      }));
    },
    [mutate],
  );

  const setMission = useCallback(
    (mission: Mission) => {
      mutate((current) => {
        let next: DateSession = { ...current, currentMissionId: mission.id };
        next = appendEventTo(next, 'mission_started', { missionId: mission.id });
        return next;
      });
    },
    [mutate, appendEventTo],
  );

  const pickAndSetMission = useCallback(
    (round: 1 | 2): Mission => {
      let picked: Mission | null = null;
      mutate((current) => {
        const mission = pickMission(round, current);
        picked = mission;
        let next: DateSession = { ...current, currentMissionId: mission.id };
        next = appendEventTo(next, 'mission_started', { missionId: mission.id });
        return next;
      });
      if (!picked) {
        throw new Error('pickAndSetMission called without an active session');
      }
      return picked;
    },
    [mutate, appendEventTo],
  );

  const rerollCurrentMission = useCallback((): Mission | null => {
    let replacement: Mission | null = null;
    mutate((current) => {
      if (current.rerollsRemaining <= 0 || !current.currentMissionId) return current;

      const round = current.currentRound === 1 ? 1 : 2;
      const previousId = current.currentMissionId;

      let next: DateSession = {
        ...current,
        rerollsRemaining: current.rerollsRemaining - 1,
        skippedMissionIds: [...current.skippedMissionIds, previousId],
        timerStartedAt: null,
        timerEndsAt: null,
      };
      next = appendEventTo(next, 'mission_rerolled', { missionId: previousId });

      const mission = pickMission(round, next, [previousId]);
      replacement = mission;
      next = { ...next, currentMissionId: mission.id };
      next = appendEventTo(next, 'mission_started', { missionId: mission.id });
      return next;
    });
    return replacement;
  }, [mutate, appendEventTo]);

  const vetoCurrentMission = useCallback(
    (partner: Partner, avoidCategory: boolean): Mission | null => {
      let replacement: Mission | null = null;
      mutate((current) => {
        if (!current.currentMissionId) return current;
        const remaining =
          partner === 'partner_one'
            ? current.partnerOneVetoRemaining
            : current.partnerTwoVetoRemaining;
        if (remaining <= 0) return current;

        const previousId = current.currentMissionId;
        const previous = getMissionById(previousId);
        const round = current.currentRound === 1 ? 1 : 2;

        let blockedCategories: MissionCategory[] = current.blockedCategories;
        if (avoidCategory && previous && !blockedCategories.includes(previous.category)) {
          blockedCategories = [...blockedCategories, previous.category];
        }

        let next: DateSession = {
          ...current,
          partnerOneVetoRemaining:
            partner === 'partner_one'
              ? current.partnerOneVetoRemaining - 1
              : current.partnerOneVetoRemaining,
          partnerTwoVetoRemaining:
            partner === 'partner_two'
              ? current.partnerTwoVetoRemaining - 1
              : current.partnerTwoVetoRemaining,
          blockedCategories,
          skippedMissionIds: [...current.skippedMissionIds, previousId],
          timerStartedAt: null,
          timerEndsAt: null,
        };
        next = appendEventTo(next, 'mission_vetoed', {
          partner,
          missionId: previousId,
          metadata: { avoidCategory },
        });

        const mission = pickMission(round, next, [previousId]);
        replacement = mission;
        next = { ...next, currentMissionId: mission.id };
        next = appendEventTo(next, 'mission_started', { missionId: mission.id });
        return next;
      });
      return replacement;
    },
    [mutate, appendEventTo],
  );

  const completeCurrentMission = useCallback(
    (metadata?: Record<string, unknown>) => {
      mutate((current) => {
        if (!current.currentMissionId) return current;
        let next: DateSession = {
          ...current,
          completedMissionIds: current.completedMissionIds.includes(current.currentMissionId)
            ? current.completedMissionIds
            : [...current.completedMissionIds, current.currentMissionId],
          timerStartedAt: null,
          timerEndsAt: null,
        };
        next = appendEventTo(next, 'mission_completed', {
          missionId: current.currentMissionId,
          metadata: { round: current.currentRound, ...metadata },
        });
        return next;
      });
    },
    [mutate, appendEventTo],
  );

  const recordAnswer = useCallback(
    (key: string, value: string, partner?: Partner) => {
      mutate((current) => ({
        ...current,
        answers: [
          ...current.answers.filter(
            (answer) => !(answer.key === key && answer.partner === partner),
          ),
          {
            id: createId(),
            key,
            value,
            partner,
            round: current.currentRound,
            createdAt: nowIso(),
          },
        ],
      }));
    },
    [mutate],
  );

  const recordEvent = useCallback(
    (
      type: SessionEventType,
      extra?: {
        partner?: Partner | 'both';
        missionId?: string;
        metadata?: Record<string, unknown>;
      },
    ) => {
      mutate((current) => appendEventTo(current, type, extra));
    },
    [mutate, appendEventTo],
  );

  const setLocationContext = useCallback(
    (context: LocationContext) => {
      mutate((current) => ({ ...current, locationContext: context }));
    },
    [mutate],
  );

  const startTimer = useCallback(
    (seconds: number) => {
      mutate((current) => {
        const startedAt = new Date();
        const endsAt = new Date(startedAt.getTime() + seconds * 1000);
        return {
          ...current,
          timerStartedAt: startedAt.toISOString(),
          timerEndsAt: endsAt.toISOString(),
        };
      });
    },
    [mutate],
  );

  const clearTimer = useCallback(() => {
    mutate((current) => ({ ...current, timerStartedAt: null, timerEndsAt: null }));
  }, [mutate]);

  const addPhotoFromUri = useCallback(
    (tempUri: string): PhotoMemory | null => {
      let added: PhotoMemory | null = null;
      mutate((current) => {
        const photoId = createId();
        let storedUri: string;
        try {
          storedUri = persistPhoto(tempUri, current.id, photoId);
        } catch {
          // If the copy fails, keep the temp URI rather than losing the moment.
          storedUri = tempUri;
        }
        const photo: PhotoMemory = {
          id: photoId,
          sessionId: current.id,
          uri: storedUri,
          round: current.currentRound,
          createdAt: nowIso(),
        };
        added = photo;
        sessionRepo.appendPhoto(photo);
        let next: DateSession = { ...current, photos: [...current.photos, photo] };
        next = appendEventTo(next, 'photo_added', {
          metadata: { round: current.currentRound },
        });
        return next;
      });
      return added;
    },
    [mutate, appendEventTo],
  );

  const finishSession = useCallback(
    (endedEarly: boolean): DateSession | null => {
      return mutate((current) => {
        let next: DateSession = {
          ...current,
          status: endedEarly ? 'ended_early' : 'completed',
          completedAt: nowIso(),
          stage: 'finished',
          timerStartedAt: null,
          timerEndsAt: null,
        };
        next = appendEventTo(next, endedEarly ? 'session_ended_early' : 'session_completed');
        const score = computeSpontaneityScore(next);
        const awards = generateAwards(next);
        next = { ...next, score, awards };
        return next;
      });
    },
    [mutate, appendEventTo],
  );

  const clearSession = useCallback(() => {
    replaceSession(null);
  }, [replaceSession]);

  const value = useMemo<DateSessionContextValue>(
    () => ({
      session,
      loadActiveSession,
      loadSessionById,
      createSession,
      startDate,
      setStage,
      advanceToRound,
      setMission,
      pickAndSetMission,
      rerollCurrentMission,
      vetoCurrentMission,
      completeCurrentMission,
      recordAnswer,
      recordEvent,
      setLocationContext,
      startTimer,
      clearTimer,
      addPhotoFromUri,
      finishSession,
      clearSession,
    }),
    [
      session,
      loadActiveSession,
      loadSessionById,
      createSession,
      startDate,
      setStage,
      advanceToRound,
      setMission,
      pickAndSetMission,
      rerollCurrentMission,
      vetoCurrentMission,
      completeCurrentMission,
      recordAnswer,
      recordEvent,
      setLocationContext,
      startTimer,
      clearTimer,
      addPhotoFromUri,
      finishSession,
      clearSession,
    ],
  );

  return <DateSessionContext.Provider value={value}>{children}</DateSessionContext.Provider>;
}

export function useDateSessionContext(): DateSessionContextValue {
  const context = useContext(DateSessionContext);
  if (!context) {
    throw new Error('useDateSessionContext must be used inside DateSessionProvider');
  }
  return context;
}
