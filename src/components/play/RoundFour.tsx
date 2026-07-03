import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { MissionCard } from '@/components/MissionCard';
import { PrivateHandoff } from '@/components/PrivateHandoff';
import { SelectionCard } from '@/components/SelectionCard';
import { PhotoCreation } from '@/components/play/RoundThree';
import { futurePickOptions, getMissionById } from '@/content/experiences/noPlanDate';
import { getRoundFourMission, pickRoundFourEnding } from '@/engine/branching';
import { useDateSession } from '@/hooks/useDateSession';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';

export function RoundFour({
  session,
  onFinishDate,
}: {
  session: DateSession;
  onFinishDate: () => void;
}) {
  const {
    setStage,
    setMission,
    recordAnswer,
    recordEvent,
    completeCurrentMission,
    startTimer,
    addPhotoFromUri,
  } = useDateSession();

  const mission = session.currentMissionId
    ? getMissionById(session.currentMissionId)
    : undefined;

  // Deterministic ending selection — also covers resume after a restart.
  useEffect(() => {
    if (session.stage === 'r4_mission' && !session.currentMissionId) {
      const ending = pickRoundFourEnding(session);
      recordAnswer('round_four_ending', ending);
      setMission(getRoundFourMission(ending));
    }
    // Runs when the mission still needs to be assigned.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.stage, session.currentMissionId]);

  if (session.stage === 'r4_mission') {
    if (!mission) return null;

    const finish = () => {
      if (!session.completedMissionIds.includes(mission.id)) {
        completeCurrentMission();
      }
      setStage('r4_complete');
    };

    if (mission.interaction === 'photo_creation') {
      return (
        <PhotoCreation
          session={session}
          mission={mission}
          startTimer={startTimer}
          addPhotoFromUri={addPhotoFromUri}
          onDone={finish}
          doneLabel="THAT'S THE ONE"
        />
      );
    }

    if (mission.interaction === 'future_pick') {
      return (
        <FuturePick
          session={session}
          onLockIn={(partner, value) => {
            recordAnswer('future_pick', value, partner);
            recordEvent('private_choice_made', { partner });
          }}
          onDone={finish}
        />
      );
    }

    return (
      <View style={styles.stack}>
        <MissionCard mission={mission} />
        <PrimaryButton label="BOTH SONGS PLAYED" haptic onPress={finish} />
      </View>
    );
  }

  // --- r4_complete ---------------------------------------------------------
  return (
    <View style={styles.centered}>
      <Text style={typography.overline}>THE LAST MOVE IS DONE</Text>
      <Text style={typography.display}>THAT&apos;S THE DATE.</Text>
      <PrimaryButton label="MAKE OUR RECAP" haptic onPress={onFinishDate} />
    </View>
  );
}

function FuturePick({
  session,
  onLockIn,
  onDone,
}: {
  session: DateSession;
  onLockIn: (partner: 'partner_one' | 'partner_two', value: string) => void;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    const p1 = session.answers.find(
      (a) => a.key === 'future_pick' && a.partner === 'partner_one',
    )?.value;
    const p2 = session.answers.find(
      (a) => a.key === 'future_pick' && a.partner === 'partner_two',
    )?.value;
    const match = Boolean(p1) && p1 === p2;

    return (
      <View style={styles.centered}>
        <View style={styles.reveal}>
          <Text style={typography.overline}>{session.partnerOneName.toUpperCase()}</Text>
          <Text style={typography.title}>{p1 ?? '—'}</Text>
          <Text style={[typography.overline, styles.revealSecond]}>
            {session.partnerTwoName.toUpperCase()}
          </Text>
          <Text style={typography.title}>{p2 ?? '—'}</Text>
        </View>
        <Text style={match ? styles.match : typography.display}>
          {match ? 'NEXT DATE UNLOCKED' : 'GOOD.\nYOU CLEARLY NEED ANOTHER DATE.'}
        </Text>
        <PrimaryButton label="FINISH THE NIGHT" haptic onPress={onDone} />
      </View>
    );
  }

  return (
    <PrivateHandoff
      partnerOneName={session.partnerOneName}
      partnerTwoName={session.partnerTwoName}
      prompt="What kind of date should we do next? Answer privately."
      onBothDone={() => setRevealed(true)}
      renderChoice={(partner, lockIn) => (
        <FuturePickChoice
          onLockIn={(value) => {
            onLockIn(partner, value);
            lockIn();
          }}
        />
      )}
    />
  );
}

function FuturePickChoice({ onLockIn }: { onLockIn: (value: string) => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <View style={styles.stack}>
      <Text style={typography.title}>WHAT KIND OF DATE SHOULD WE DO NEXT?</Text>
      {futurePickOptions.map((option) => (
        <SelectionCard
          key={option}
          title={option}
          selected={choice === option}
          onPress={() => setChoice(option)}
        />
      ))}
      <PrimaryButton
        label="LOCK IT IN"
        haptic
        disabled={choice === null}
        onPress={() => choice && onLockIn(choice)}
      />
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
  reveal: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  revealSecond: {
    marginTop: spacing.md,
  },
  match: {
    ...typography.display,
    color: colors.gold,
  },
});
