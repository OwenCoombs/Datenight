import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { FateWheel } from '@/components/FateWheel';
import { MissionCard } from '@/components/MissionCard';
import { PhotoCapture } from '@/components/PhotoCapture';
import { PrivateHandoff } from '@/components/PrivateHandoff';
import { SelectionCard } from '@/components/SelectionCard';
import { PersistentTimer } from '@/components/Timer';
import { fateWheelOptions, getMissionById } from '@/content/experiences/noPlanDate';
import { combineRoundThreeChoices, resolveRoundThreeMission } from '@/engine/branching';
import { sessionToContext } from '@/engine/dateEngine';
import { useDateSession } from '@/hooks/useDateSession';
import { usePersistentTimer } from '@/hooks/usePersistentTimer';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession, Mission, RoundThreeChoice } from '@/types/date';

const choiceOptions: { value: RoundThreeChoice; emoji: string; label: string }[] = [
  { value: 'funnier', emoji: '😂', label: 'Make the night funnier' },
  { value: 'sweeter', emoji: '❤️', label: 'Make the night sweeter' },
  { value: 'weirder', emoji: '🎲', label: 'Make the night weirder' },
];

export function RoundThree({ session }: { session: DateSession }) {
  const {
    setStage,
    setMission,
    recordAnswer,
    recordEvent,
    completeCurrentMission,
    advanceToRound,
    startTimer,
    addPhotoFromUri,
  } = useDateSession();

  // Choices held locally until both are locked in, then combined.
  const choicesRef = useRef<{ p1?: RoundThreeChoice; p2?: RoundThreeChoice }>({});

  const mission = session.currentMissionId
    ? getMissionById(session.currentMissionId)
    : undefined;

  // --- Private locked choice ------------------------------------------------
  if (session.stage === 'r3_private_choice') {
    return (
      <PrivateHandoff
        partnerOneName={session.partnerOneName}
        partnerTwoName={session.partnerTwoName}
        prompt="Make a private choice. No one sees your answer."
        onBothDone={() => {
          const { p1, p2 } = choicesRef.current;
          if (!p1 || !p2) return;
          const combo = combineRoundThreeChoices(p1, p2);
          recordAnswer('round_three_combo', combo);
          const resolved = resolveRoundThreeMission(combo, sessionToContext(session));
          setMission(resolved);
          setStage('r3_mission');
        }}
        renderChoice={(partner, lockIn) => (
          <LockedChoice
            onLockIn={(choice) => {
              if (partner === 'partner_one') choicesRef.current.p1 = choice;
              else choicesRef.current.p2 = choice;
              recordAnswer('round_three_choice', choice, partner);
              recordEvent('private_choice_made', { partner });
              lockIn();
            }}
          />
        )}
      />
    );
  }

  // --- Mission ---------------------------------------------------------------
  if (session.stage === 'r3_mission') {
    if (!mission) return null;
    const finish = () => {
      if (!session.completedMissionIds.includes(mission.id)) {
        completeCurrentMission();
      }
      setStage('r3_complete');
    };

    if (mission.interaction === 'photo_creation') {
      return (
        <PhotoCreation
          session={session}
          mission={mission}
          startTimer={startTimer}
          addPhotoFromUri={addPhotoFromUri}
          onDone={finish}
        />
      );
    }

    if (mission.interaction === 'fate_wheel') {
      return (
        <View style={styles.stack}>
          <MissionCard mission={mission}>
            <FateWheel options={fateWheelOptions} />
          </MissionCard>
          <PrimaryButton label="WE DID WHAT FATE SAID" haptic onPress={finish} />
        </View>
      );
    }

    // private_moment and plain instructions
    return (
      <View style={styles.stack}>
        <MissionCard mission={mission}>
          {mission.interaction === 'private_moment' ? (
            <Text style={styles.privateNote}>This moment stays private.</Text>
          ) : null}
        </MissionCard>
        <PrimaryButton
          label={mission.interaction === 'private_moment' ? 'WE DID IT' : 'DONE'}
          haptic
          onPress={finish}
        />
      </View>
    );
  }

  // --- Complete ----------------------------------------------------------------
  return (
    <View style={styles.centered}>
      <Text style={typography.overline}>ROUND THREE COMPLETE</Text>
      <Text style={typography.display}>ONE MOVE LEFT.</Text>
      <PrimaryButton
        label="REVEAL THE LAST MISSION"
        haptic
        onPress={() => advanceToRound(4, 'r4_mission')}
      />
    </View>
  );
}

function LockedChoice({ onLockIn }: { onLockIn: (choice: RoundThreeChoice) => void }) {
  const [choice, setChoice] = useState<RoundThreeChoice | null>(null);
  return (
    <View style={styles.stack}>
      <Text style={typography.overline}>THE LOCKED CHOICE</Text>
      <Text style={typography.title}>PICK ONE. PRIVATELY.</Text>
      {choiceOptions.map((option) => (
        <SelectionCard
          key={option.value}
          title={option.label}
          emoji={option.emoji}
          selected={choice === option.value}
          onPress={() => setChoice(option.value)}
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

/** Shared photo-mission widget: optional timer, optional album name, capture. */
export function PhotoCreation({
  session,
  mission,
  startTimer,
  addPhotoFromUri,
  onDone,
  doneLabel = 'BOTH APPROVED',
}: {
  session: DateSession;
  mission: Mission;
  startTimer: (seconds: number) => void;
  addPhotoFromUri: (uri: string) => unknown;
  onDone: () => void;
  doneLabel?: string;
}) {
  const { recordAnswer } = useDateSession();
  const [albumName, setAlbumName] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const timerRunning = session.timerEndsAt !== null;
  usePersistentTimer(session.timerEndsAt);

  const isAlbumCover = mission.id === 'r3_terrible_photo';

  const finish = () => {
    if (isAlbumCover && albumName.trim()) {
      recordAnswer('album_name', albumName.trim());
    }
    onDone();
  };

  return (
    <View style={styles.stack}>
      <MissionCard mission={mission}>
        {mission.timerSeconds && timerRunning ? (
          <PersistentTimer timerEndsAt={session.timerEndsAt} />
        ) : null}
        {mission.timerSeconds && !timerRunning && !photoTaken ? (
          <PrimaryButton
            label="START 5-MINUTE TIMER"
            variant="secondary"
            onPress={() => startTimer(mission.timerSeconds ?? 300)}
          />
        ) : null}
        {isAlbumCover ? (
          <TextInput
            style={styles.input}
            placeholder="Fake album name"
            placeholderTextColor={colors.textTertiary}
            value={albumName}
            onChangeText={setAlbumName}
            accessibilityLabel="Fake album name"
          />
        ) : null}
      </MissionCard>

      {!photoTaken ? (
        <PhotoCapture
          onPhoto={(uri) => {
            addPhotoFromUri(uri);
            setPhotoTaken(true);
          }}
          onSkip={finish}
          skipLabel="SKIP PHOTO"
        />
      ) : (
        <PrimaryButton label={doneLabel} haptic onPress={finish} />
      )}
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
  privateNote: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
});
