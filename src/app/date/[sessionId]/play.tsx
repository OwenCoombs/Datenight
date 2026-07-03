import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { ProgressIndicator } from '@/components/ProgressBar';
import { RerollButton } from '@/components/RerollButton';
import { Screen } from '@/components/Screen';
import { VetoModal } from '@/components/VetoModal';
import { RoundOne } from '@/components/play/RoundOne';
import { RoundTwo } from '@/components/play/RoundTwo';
import { RoundThree } from '@/components/play/RoundThree';
import { RoundFour } from '@/components/play/RoundFour';
import * as sessionRepo from '@/db/sessionRepository';
import { useDateSession } from '@/hooks/useDateSession';
import { colors } from '@/theme/colors';
import { radius, spacing, touchTarget } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const MISSION_STAGES = new Set([
  'r1_mission',
  'r2_mission',
  'r3_mission',
  'r4_mission',
]);

export default function PlayScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const {
    session,
    loadSessionById,
    rerollCurrentMission,
    vetoCurrentMission,
    finishSession,
  } = useDateSession();

  const [vetoVisible, setVetoVisible] = useState(false);
  const [endVisible, setEndVisible] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const rerollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pure read to detect a missing/corrupted session without touching
  // state. retryKey forces a fresh read when the user taps TRY TO RESUME.
  const storedExists = useMemo(
    () => (sessionId ? sessionRepo.getSessionById(sessionId) !== null : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, retryKey],
  );
  const loadFailed = Boolean(sessionId) && !storedExists;

  useEffect(() => {
    if (sessionId && storedExists && (!session || session.id !== sessionId)) {
      loadSessionById(sessionId);
    }
  }, [sessionId, storedExists, session, loadSessionById]);

  useEffect(() => {
    return () => {
      if (rerollTimeout.current) clearTimeout(rerollTimeout.current);
    };
  }, []);

  if (loadFailed) {
    return (
      <Screen scroll={false} centered>
        <View style={styles.errorBox}>
          <Text style={typography.title}>WE COULDN&apos;T LOAD THIS DATE.</Text>
          <Text style={typography.bodySecondary}>
            The saved session looks damaged. You can try again or head home.
          </Text>
        </View>
        <PrimaryButton label="TRY TO RESUME" onPress={() => setRetryKey((k) => k + 1)} />
        <PrimaryButton
          label="GO HOME"
          variant="secondary"
          onPress={() => router.replace('/home')}
        />
      </Screen>
    );
  }

  if (!session || session.id !== sessionId) {
    return <Screen scroll={false} centered />;
  }

  if (session.status === 'completed' || session.status === 'ended_early') {
    return <Redirect href={`/date/${session.id}/recap`} />;
  }

  const showActionBar = MISSION_STAGES.has(session.stage);
  const vetoAvailable =
    session.partnerOneVetoRemaining > 0 || session.partnerTwoVetoRemaining > 0;

  const handleReroll = () => {
    if (session.rerollsRemaining <= 0 || rerolling) return;
    setRerolling(true);
    rerollCurrentMission();
    rerollTimeout.current = setTimeout(() => setRerolling(false), 1400);
  };

  const finishAndRecap = (endedEarly: boolean) => {
    setEndVisible(false);
    const finished = finishSession(endedEarly);
    if (finished) {
      router.replace(`/date/${finished.id}/recap`);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <ProgressIndicator current={session.currentRound} />
        <PrimaryButton
          label="END DATE"
          variant="ghost"
          style={styles.endButton}
          onPress={() => setEndVisible(true)}
        />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {session.currentRound === 1 ? <RoundOne session={session} /> : null}
        {session.currentRound === 2 ? <RoundTwo session={session} /> : null}
        {session.currentRound === 3 ? <RoundThree session={session} /> : null}
        {session.currentRound === 4 ? (
          <RoundFour session={session} onFinishDate={() => finishAndRecap(false)} />
        ) : null}
      </ScrollView>

      {showActionBar ? (
        <View style={styles.actionBar}>
          <RerollButton
            rerollsRemaining={session.rerollsRemaining}
            onReroll={handleReroll}
          />
          {vetoAvailable ? (
            <PrimaryButton
              label="NOT FOR ME"
              variant="secondary"
              style={styles.vetoButton}
              onPress={() => setVetoVisible(true)}
            />
          ) : null}
        </View>
      ) : null}

      <VetoModal
        visible={vetoVisible}
        partnerOneName={session.partnerOneName}
        partnerTwoName={session.partnerTwoName}
        partnerOneVetoRemaining={session.partnerOneVetoRemaining}
        partnerTwoVetoRemaining={session.partnerTwoVetoRemaining}
        onClose={() => setVetoVisible(false)}
        onVeto={(partner, avoidCategory) => {
          setVetoVisible(false);
          setRerolling(true);
          vetoCurrentMission(partner, avoidCategory);
          rerollTimeout.current = setTimeout(() => setRerolling(false), 1400);
        }}
      />

      <Modal visible={endVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={typography.title}>CALLING IT A NIGHT?</Text>
            <PrimaryButton
              label="FINISH AND MAKE OUR RECAP"
              onPress={() => finishAndRecap(true)}
            />
            <PrimaryButton
              label="KEEP PLAYING"
              variant="secondary"
              onPress={() => setEndVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {rerolling ? (
        <View style={styles.rerollOverlay}>
          <Text style={styles.rerollTitle}>FATE HAS BEEN FIRED.</Text>
          <Text style={typography.bodySecondary}>Finding something better...</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  endButton: {
    minHeight: touchTarget,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  vetoButton: {
    flexGrow: 1,
    minHeight: touchTarget,
    paddingVertical: spacing.sm,
  },
  errorBox: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  rerollOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rerollTitle: {
    ...typography.title,
    color: colors.accent,
  },
});
