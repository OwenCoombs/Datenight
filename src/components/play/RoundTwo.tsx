import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { MissionCard } from '@/components/MissionCard';
import { PhotoCapture } from '@/components/PhotoCapture';
import { PrivateHandoff } from '@/components/PrivateHandoff';
import { SelectionCard } from '@/components/SelectionCard';
import { PersistentTimer } from '@/components/Timer';
import {
  activityModifiers,
  fallbackMenuOptions,
  getMissionById,
  huntCategories,
  roundTwoBonus,
} from '@/content/experiences/noPlanDate';
import { isPhotographyAllowed } from '@/engine/eligibility';
import { useDateSession } from '@/hooks/useDateSession';
import { usePersistentTimer } from '@/hooks/usePersistentTimer';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession, LocationContext, Mission } from '@/types/date';
import { pickRandom, shuffle } from '@/utils/random';

const contextOptions: { value: LocationContext; label: string }[] = [
  { value: 'food_drink', label: 'Somewhere to eat or drink' },
  { value: 'store', label: 'A store' },
  { value: 'activity', label: 'An activity' },
  { value: 'none', label: 'None of these' },
];

export function RoundTwo({ session }: { session: DateSession }) {
  const {
    setStage,
    setLocationContext,
    pickAndSetMission,
    recordAnswer,
    completeCurrentMission,
    advanceToRound,
  } = useDateSession();

  const mission = session.currentMissionId
    ? getMissionById(session.currentMissionId)
    : undefined;

  // --- Context question ---------------------------------------------------
  if (session.stage === 'r2_context') {
    return (
      <View style={styles.centered}>
        <Text style={typography.display}>WHERE DID YOU END UP?</Text>
        <View style={styles.stack}>
          {contextOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              onPress={() => {
                setLocationContext(option.value);
                pickAndSetMission(2);
                setStage('r2_mission');
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  // --- Mission -------------------------------------------------------------
  if (session.stage === 'r2_mission') {
    if (!mission) return null;
    return (
      <RoundTwoMission
        session={session}
        mission={mission}
        onDone={() => setStage('r2_winner')}
      />
    );
  }

  // --- Winner vote -----------------------------------------------------
  if (session.stage === 'r2_winner') {
    return (
      <WinnerVote
        session={session}
        onDone={(winner) => {
          recordAnswer('round_two_winner', winner);
          if (
            session.currentMissionId &&
            !session.completedMissionIds.includes(session.currentMissionId)
          ) {
            completeCurrentMission();
          }
          setStage('r2_complete');
        }}
      />
    );
  }

  // --- Complete ------------------------------------------------------------
  const winner = session.answers.find((a) => a.key === 'round_two_winner')?.value;
  return (
    <View style={styles.centered}>
      <Text style={typography.overline}>ROUND TWO COMPLETE</Text>
      <Text style={typography.display}>{winnerMessage(winner, session)}</Text>
      <PrimaryButton
        label="REVEAL THE NEXT MISSION"
        haptic
        onPress={() => advanceToRound(3, 'r3_private_choice')}
      />
    </View>
  );
}

function winnerMessage(winner: string | undefined, session: DateSession): string {
  if (winner === 'both') return 'SUSPICIOUSLY HEALTHY.';
  if (winner === 'nobody') return 'PERFECT.';
  if (winner === 'partner_one') return `${session.partnerOneName.toUpperCase()} TAKES IT.`;
  if (winner === 'partner_two') return `${session.partnerTwoName.toUpperCase()} TAKES IT.`;
  return 'NOTED.';
}

// ---------------------------------------------------------------------------

function RoundTwoMission({
  session,
  mission,
  onDone,
}: {
  session: DateSession;
  mission: Mission;
  onDone: () => void;
}) {
  switch (mission.interaction) {
    case 'bonus_offer':
      return <FirstYes mission={mission} onDone={onDone} />;
    case 'solo_timer_then_ratings':
      return <FiveDollarRead session={session} mission={mission} onDone={onDone} />;
    case 'modifier_draw':
      return <PartnerRule session={session} mission={mission} onDone={onDone} />;
    case 'hunt_draw':
      return <FiveMinuteHunt session={session} mission={mission} onDone={onDone} />;
    default:
      return <FallbackMenu session={session} mission={mission} onDone={onDone} />;
  }
}

/** FOOD OR DRINK — THE FIRST YES */
function FirstYes({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const { recordEvent } = useDateSession();
  const [bonusAccepted, setBonusAccepted] = useState(false);

  return (
    <View style={styles.stack}>
      <MissionCard mission={mission}>
        <View style={styles.bonusBox}>
          <Text style={styles.bonusLabel}>{roundTwoBonus.label}</Text>
          <Text style={typography.body}>{roundTwoBonus.text}</Text>
        </View>
      </MissionCard>
      {bonusAccepted ? (
        <PrimaryButton label="WE ORDERED" haptic onPress={onDone} />
      ) : (
        <>
          <PrimaryButton
            label="DO THE BONUS"
            haptic
            onPress={() => {
              recordEvent('bonus_accepted', {
                partner: 'both',
                missionId: mission.id,
              });
              setBonusAccepted(true);
            }}
          />
          <PrimaryButton label="KEEP IT NORMAL" variant="secondary" onPress={onDone} />
        </>
      )}
    </View>
  );
}

/** STORE — THE $5 READ */
function FiveDollarRead({
  session,
  mission,
  onDone,
}: {
  session: DateSession;
  mission: Mission;
  onDone: () => void;
}) {
  const { startTimer, clearTimer, recordAnswer } = useDateSession();
  const { isDone } = usePersistentTimer(session.timerEndsAt);
  const timerRunning = session.timerEndsAt !== null;
  const [phase, setPhase] = useState<'shop' | 'reveal' | 'ratings'>('shop');

  if (phase === 'shop') {
    return (
      <View style={styles.stack}>
        <MissionCard mission={mission}>
          {timerRunning ? <PersistentTimer timerEndsAt={session.timerEndsAt} /> : null}
        </MissionCard>
        {!timerRunning ? (
          <PrimaryButton
            label="START 10-MINUTE TIMER"
            haptic
            onPress={() => startTimer(mission.timerSeconds ?? 600)}
          />
        ) : (
          <PrimaryButton
            label={isDone ? "WE'RE BACK" : 'SKIP AHEAD'}
            variant={isDone ? 'primary' : 'ghost'}
            haptic={isDone}
            onPress={() => {
              clearTimer();
              setPhase('reveal');
            }}
          />
        )}
      </View>
    );
  }

  if (phase === 'reveal') {
    return (
      <View style={styles.centered}>
        <Text style={typography.display}>REVEAL AT THE SAME TIME.</Text>
        <PrimaryButton label="WE REVEALED" haptic onPress={() => setPhase('ratings')} />
      </View>
    );
  }

  return (
    <PrivateHandoff
      partnerOneName={session.partnerOneName}
      partnerTwoName={session.partnerTwoName}
      prompt="Rate how accurate their choice was. Your rating stays private."
      onBothDone={onDone}
      renderChoice={(partner, lockIn) => (
        <AccuracyRating
          onLockIn={(rating) => {
            recordAnswer('five_dollar_accuracy', String(rating), partner);
            lockIn();
          }}
        />
      )}
    />
  );
}

function AccuracyRating({ onLockIn }: { onLockIn: (rating: number) => void }) {
  const [rating, setRating] = useState<number | null>(null);
  return (
    <View style={styles.stack}>
      <Text style={typography.title}>HOW ACCURATE WAS THEIR CHOICE?</Text>
      <Text style={typography.bodySecondary}>
        1 = Absolutely not me · 10 = Disturbingly accurate
      </Text>
      <View style={styles.ratingGrid}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <PrimaryButton
            key={n}
            label={String(n)}
            variant={rating === n ? 'primary' : 'secondary'}
            style={styles.ratingButton}
            onPress={() => setRating(n)}
          />
        ))}
      </View>
      <PrimaryButton
        label="LOCK IN MY RATING"
        haptic
        disabled={rating === null}
        onPress={() => rating !== null && onLockIn(rating)}
      />
    </View>
  );
}

/** ACTIVITY — YOUR PARTNER CHOOSES YOUR RULE */
function PartnerRule({
  session,
  mission,
  onDone,
}: {
  session: DateSession;
  mission: Mission;
  onDone: () => void;
}) {
  const { recordAnswer } = useDateSession();
  const ruleOne = session.answers.find((a) => a.key === 'r2_rule_p1')?.value;
  const ruleTwo = session.answers.find((a) => a.key === 'r2_rule_p2')?.value;

  useEffect(() => {
    if (!ruleOne || !ruleTwo) {
      const eligible = activityModifiers.filter(
        (modifier) =>
          !modifier.boundary || !session.blockedBoundaries.includes(modifier.boundary),
      );
      const drawn = shuffle(eligible);
      recordAnswer('r2_rule_p1', drawn[0]?.text ?? eligible[0].text);
      recordAnswer('r2_rule_p2', (drawn[1] ?? drawn[0])?.text ?? eligible[0].text);
    }
    // Draw exactly once per mission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ruleOne || !ruleTwo) return null;

  return (
    <View style={styles.stack}>
      <MissionCard mission={mission}>
        <View style={styles.ruleBox}>
          <Text style={typography.overline}>{session.partnerOneName.toUpperCase()}</Text>
          <Text style={typography.body}>{ruleOne}</Text>
        </View>
        <View style={styles.ruleBox}>
          <Text style={typography.overline}>{session.partnerTwoName.toUpperCase()}</Text>
          <Text style={typography.body}>{ruleTwo}</Text>
        </View>
      </MissionCard>
      <PrimaryButton label="WE PLAYED IT" haptic onPress={onDone} />
    </View>
  );
}

/** NONE OF THESE — THE FIVE-MINUTE HUNT */
function FiveMinuteHunt({
  session,
  mission,
  onDone,
}: {
  session: DateSession;
  mission: Mission;
  onDone: () => void;
}) {
  const { startTimer, clearTimer, recordAnswer, addPhotoFromUri } = useDateSession();
  const { isDone } = usePersistentTimer(session.timerEndsAt);
  const timerRunning = session.timerEndsAt !== null;
  const hunt = session.answers.find((a) => a.key === 'r2_hunt')?.value;
  const photographyAllowed = isPhotographyAllowed(session.blockedBoundaries);
  const [photoStep, setPhotoStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!hunt) {
      recordAnswer('r2_hunt', pickRandom(huntCategories));
    }
    // Draw exactly once per mission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hunt) return null;

  if (photoStep > 0) {
    const name = photoStep === 1 ? session.partnerOneName : session.partnerTwoName;
    const next = () => (photoStep === 1 ? setPhotoStep(2) : onDone());
    return (
      <View style={styles.centered}>
        <Text style={typography.title}>
          {name.toUpperCase()}&apos;S ENTRY
        </Text>
        <Text style={typography.bodySecondary}>One photo of your find. Optional.</Text>
        <PhotoCapture
          onPhoto={(uri) => {
            addPhotoFromUri(uri);
            next();
          }}
          onSkip={next}
        />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <MissionCard mission={mission}>
        <View style={styles.categoryBox}>
          <Text style={styles.categoryText}>{hunt.toUpperCase()}</Text>
        </View>
        {timerRunning ? <PersistentTimer timerEndsAt={session.timerEndsAt} /> : null}
      </MissionCard>
      {!timerRunning ? (
        <PrimaryButton
          label="START 5-MINUTE TIMER"
          haptic
          onPress={() => startTimer(mission.timerSeconds ?? 300)}
        />
      ) : (
        <PrimaryButton
          label={isDone ? 'JUDGE THE ENTRIES' : 'SKIP AHEAD'}
          variant={isDone ? 'primary' : 'ghost'}
          haptic={isDone}
          onPress={() => {
            clearTimer();
            if (photographyAllowed) {
              setPhotoStep(1);
            } else {
              onDone();
            }
          }}
        />
      )}
    </View>
  );
}

/** Safe fallback — YOUR MOVE */
function FallbackMenu({
  session,
  mission,
  onDone,
}: {
  session: DateSession;
  mission: Mission;
  onDone: () => void;
}) {
  const { recordAnswer } = useDateSession();
  const chosen = session.answers.find((a) => a.key === 'fallback_choice')?.value;

  return (
    <View style={styles.stack}>
      <MissionCard mission={mission}>
        {fallbackMenuOptions.map((option) => (
          <SelectionCard
            key={option}
            title={option}
            selected={chosen === option}
            onPress={() => recordAnswer('fallback_choice', option)}
          />
        ))}
      </MissionCard>
      <PrimaryButton label="WE DID IT" haptic disabled={!chosen} onPress={onDone} />
    </View>
  );
}

function WinnerVote({
  session,
  onDone,
}: {
  session: DateSession;
  onDone: (winner: string) => void;
}) {
  const options = [
    { value: 'partner_one', label: session.partnerOneName },
    { value: 'partner_two', label: session.partnerTwoName },
    { value: 'nobody', label: 'Nobody' },
    { value: 'both', label: 'Both of us' },
  ];
  return (
    <View style={styles.centered}>
      <Text style={typography.display}>WHO WON THAT ROUND?</Text>
      <View style={styles.stack}>
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.label}
            onPress={() => onDone(option.value)}
          />
        ))}
      </View>
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
  bonusBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: spacing.md,
    gap: spacing.xs,
  },
  bonusLabel: {
    ...typography.overline,
    color: colors.accent,
  },
  ruleBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  categoryBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
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
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ratingButton: {
    flexBasis: '17%',
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: 0,
  },
});
