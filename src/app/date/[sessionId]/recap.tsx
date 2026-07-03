import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { RecapCard } from '@/components/RecapCard';
import { Screen } from '@/components/Screen';
import { ShareCard } from '@/components/ShareCard';
import { useShareRecap } from '@/hooks/useShareRecap';
import { getSessionById } from '@/db/sessionRepository';
import { useDateSession } from '@/hooks/useDateSession';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';

/** Post-date recap with a staged reveal, then save/share actions. */
export default function RecapScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { clearSession } = useDateSession();
  const session = useMemo<DateSession | null>(
    () => (sessionId ? getSessionById(sessionId) : null),
    [sessionId],
  );
  const [revealed, setRevealed] = useState(false);
  const [fade] = useState(() => new Animated.Value(0));
  const shareCardRef = useRef<View>(null);
  const { share, sharing, error: shareError } = useShareRecap(shareCardRef);

  useEffect(() => {
    // Dark beat, then the reveal.
    const timeout = setTimeout(() => {
      setRevealed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 1200);
    return () => clearTimeout(timeout);
  }, [fade]);

  if (!session) {
    return <Screen scroll={false} centered />;
  }

  if (!revealed) {
    return (
      <Screen scroll={false} centered>
        <Text style={styles.survived}>YOU SURVIVED{'\n'}THE NO-PLAN DATE.</Text>
      </Screen>
    );
  }

  const goHome = () => {
    clearSession();
    try {
      router.dismissAll();
    } catch {
      // Nothing to dismiss — fine.
    }
    router.replace('/home');
  };

  return (
    <Screen>
      <Animated.View style={{ opacity: fade, gap: spacing.lg }}>
        <Text style={styles.survivedSmall}>YOU SURVIVED THE NO-PLAN DATE.</Text>
        <RecapCard session={session} />

        {shareError ? (
          <Text style={[typography.bodySecondary, styles.shareError]}>{shareError}</Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="SHARE OUR NIGHT"
            haptic
            loading={sharing}
            onPress={share}
          />
          <PrimaryButton label="SAVE RECAP" variant="secondary" onPress={goHome} />
        </View>
      </Animated.View>

      {/* Offscreen 9:16 card used only for image capture. */}
      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard ref={shareCardRef} session={session} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  survived: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: '#F5F5F7',
    textAlign: 'center',
  },
  survivedSmall: {
    ...typography.overline,
    marginTop: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  shareError: {
    textAlign: 'center',
  },
  offscreen: {
    position: 'absolute',
    left: -1000,
    top: 0,
  },
});
