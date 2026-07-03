import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { CoinFlip } from '@/components/CoinFlip';
import { MissionCard } from '@/components/MissionCard';
import { PhotoCapture } from '@/components/PhotoCapture';
import { PersistentTimer } from '@/components/Timer';
import {
  firstPlaceCategories,
  getMissionById,
  walkFindPrompt,
} from '@/content/experiences/noPlanDate';
import { isPhotographyAllowed } from '@/engine/eligibility';
import { usePersistentTimer } from '@/hooks/usePersistentTimer';
import { useDateSession } from '@/hooks/useDateSession';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';
import { pickRandom } from '@/utils/random';

const detourResults = [
  { value: 'found_something', label: '😎 We found something' },
  { value: 'stupid_but_yes', label: '😂 This was stupid, but yes' },
  { value: 'total_failure', label: '💀 Total failure' },
] as const;

export function RoundOne({ session }: { session: DateSession }) {
  const {
    setStage,
    recordAnswer,
    completeCurrentMission,
    addPhotoFromUri,
    advanceToRound,
    startTimer,
    clearTimer,
  } = useDateSession();

  const mission = session.currentMissionId
    ? getMissionById(session.currentMissionId)
    : undefined;
  const photographyAllowed = isPhotographyAllowed(session.blockedBoundaries);

  const finishMission = () => {
    if (
      session.currentMissionId &&
      !session.completedMissionIds.includes(session.currentMissionId)
    ) {
      completeCurrentMission();
    }
  };

  // --- Handoff (driving only) -------------------------------------------
  if (session.stage === 'r1_handoff') {
    return (
      <View style={styles.centered}>
        <Text style={typography.display}>GIVE THE PHONE TO THE PASSENGER.</Text>
        <Text style={typography.bodySecondary}>
          The driver should not touch or look at the app again until you&apos;re parked.
        </Text>
        <PrimaryButton
          label="I'M THE PASSENGER"
          haptic
          onPress={() => setStage('r1_mission')}
        />
      </View>
    );
  }

  // --- Mission -----------------------------------------------------------
  if (session.stage === 'r1_mission') {
    if (!mission) return null;

    if (mission.interaction === 'walk_then_find') {
      return (
        <WalkThenFind
          session={session}
          onDone={() => setStage('r1_result')}
          startTimer={startTimer}
          clearTimer={clearTimer}
          recordAnswer={recordAnswer}
        />
      );
    }

    const drawnCategory = session.answers.find((a) => a.key === 'r1_category')?.value;

    return (
      <View style={styles.stack}>
        <MissionCard mission={mission}>
          {mission.interaction === 'coin_flip' ? <CoinFlip /> : null}
          {mission.interaction === 'category_draw' ? (
            <CategoryDraw
              drawn={drawnCategory}
              onDraw={(category) => recordAnswer('r1_category', category)}
            />
          ) : null}
        </MissionCard>
        <PrimaryButton
          label="WE FOUND OUR PLACE"
          haptic
          onPress={() => setStage('r1_result')}
        />
      </View>
    );
  }

  // --- Result ------------------------------------------------------------
  if (session.stage === 'r1_result') {
    return (
      <View style={styles.centered}>
        <Text style={typography.display}>DID THE DETOUR WORK?</Text>
        <View style={styles.stack}>
          {detourResults.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              variant="secondary"
              onPress={() => {
                recordAnswer('round_one_result', option.value);
                if (photographyAllowed) {
                  setStage('r1_photo');
                } else {
                  finishMission();
                  setStage('r1_complete');
                }
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  // --- Photo -------------------------------------------------------------
  if (session.stage === 'r1_photo') {
    const advance = () => {
      finishMission();
      setStage('r1_complete');
    };
    return (
      <View style={styles.centered}>
        <Text style={typography.display}>TAKE ONE PHOTO.</Text>
        <Text style={typography.bodySecondary}>
          Not because it needs to be beautiful.{'\n'}Because you might want it later.
        </Text>
        <PhotoCapture
          onPhoto={(uri) => {
            addPhotoFromUri(uri);
            advance();
          }}
          onSkip={advance}
        />
      </View>
    );
  }

  // --- Complete ----------------------------------------------------------
  return (
    <RoundOneComplete onNext={() => advanceToRound(2, 'r2_context')} />
  );
}

function CategoryDraw({
  drawn,
  onDraw,
}: {
  drawn: string | undefined;
  onDraw: (category: string) => void;
}) {
  useEffect(() => {
    if (!drawn) {
      onDraw(pickRandom(firstPlaceCategories));
    }
    // Draw exactly once per mission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!drawn) return null;
  return (
    <View style={styles.categoryBox}>
      <Text style={styles.categoryText}>{drawn.toUpperCase()}</Text>
    </View>
  );
}

function WalkThenFind({
  session,
  onDone,
  startTimer,
  clearTimer,
  recordAnswer,
}: {
  session: DateSession;
  onDone: () => void;
  startTimer: (seconds: number) => void;
  clearTimer: () => void;
  recordAnswer: (key: string, value: string) => void;
}) {
  const mission = session.currentMissionId
    ? getMissionById(session.currentMissionId)
    : undefined;
  const phase = session.answers.find((a) => a.key === 'r1_walk_phase')?.value ?? 'walk';
  const { isDone } = usePersistentTimer(session.timerEndsAt);
  const timerRunning = session.timerEndsAt !== null;

  if (!mission) return null;

  if (phase === 'walk') {
    return (
      <View style={styles.stack}>
        <MissionCard mission={mission}>
          {timerRunning ? <PersistentTimer timerEndsAt={session.timerEndsAt} /> : null}
        </MissionCard>
        {!timerRunning ? (
          <PrimaryButton
            label="START TIMER"
            haptic
            onPress={() => startTimer(mission.timerSeconds ?? 600)}
          />
        ) : (
          <PrimaryButton
            label={isDone ? "WE'RE HERE" : 'SKIP AHEAD'}
            variant={isDone ? 'primary' : 'ghost'}
            haptic={isDone}
            onPress={() => {
              clearTimer();
              recordAnswer('r1_walk_phase', 'find');
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.findCard}>
        <Text style={typography.overline}>THE DETOUR</Text>
        <Text style={typography.title}>{walkFindPrompt.title.toUpperCase()}</Text>
        <Text style={typography.body}>It could be:</Text>
        {walkFindPrompt.examples.map((example) => (
          <Text key={example} style={typography.bodySecondary}>
            •  {example}
          </Text>
        ))}
        {timerRunning ? <PersistentTimer timerEndsAt={session.timerEndsAt} /> : null}
      </View>
      {!timerRunning ? (
        <PrimaryButton
          label="START 5-MINUTE TIMER"
          haptic
          onPress={() => startTimer(walkFindPrompt.timerSeconds)}
        />
      ) : null}
      <PrimaryButton label="WE FOUND SOMETHING" haptic onPress={onDone} />
    </View>
  );
}

function RoundOneComplete({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={styles.centered}>
      <Text style={typography.overline}>DETOUR COMPLETE</Text>
      <Text style={styles.points}>+20 SPONTANEITY</Text>
      <Text style={[typography.title, styles.easyOne]}>
        OKAY.{'\n'}THAT WAS THE EASY ONE.
      </Text>
      <PrimaryButton label="REVEAL THE NEXT MISSION" haptic onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  stack: {
    gap: spacing.md,
  },
  categoryBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: spacing.lg,
    alignItems: 'center',
  },
  categoryText: {
    ...typography.heading,
    color: colors.gold,
    textAlign: 'center',
  },
  findCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  points: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: -1,
  },
  easyOne: {
    marginTop: spacing.xl,
  },
});
