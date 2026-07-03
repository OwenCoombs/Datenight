import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { RecapCard } from '@/components/RecapCard';
import { Screen } from '@/components/Screen';
import { ShareCard } from '@/components/ShareCard';
import { deleteSession, getSessionById } from '@/db/sessionRepository';
import { useShareRecap } from '@/hooks/useShareRecap';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';
import { deleteSessionPhotos } from '@/utils/media';

/** Full recap for a previous date, with share and delete. */
export default function HistoryDetail() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  // `deleted` keeps the recap on screen until navigation completes.
  const [deleted, setDeleted] = useState(false);
  const session = useMemo<DateSession | null>(
    () => (sessionId && !deleted ? getSessionById(sessionId) : null),
    [sessionId, deleted],
  );
  const missing = Boolean(sessionId) && !deleted && session === null;
  const shareCardRef = useRef<View>(null);
  const { share, sharing, error: shareError } = useShareRecap(shareCardRef);

  const confirmDelete = () => {
    if (!session) return;
    Alert.alert(
      'Delete this date?',
      'The recap and its photos will be gone for good.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession(session.id);
            deleteSessionPhotos(session.id);
            setDeleted(true);
            router.back();
          },
        },
      ],
    );
  };

  if (missing) {
    return (
      <Screen scroll={false} centered>
        <Text style={typography.title}>THIS DATE ISN&apos;T HERE ANYMORE.</Text>
        <PrimaryButton label="BACK" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!session) {
    return <Screen scroll={false} centered />;
  }

  return (
    <Screen>
      <View style={styles.content}>
        <RecapCard session={session} />

        {shareError ? (
          <Text style={[typography.bodySecondary, styles.shareError]}>{shareError}</Text>
        ) : null}

        <PrimaryButton label="SHARE OUR NIGHT" loading={sharing} onPress={share} />
        <PrimaryButton label="BACK" variant="secondary" onPress={() => router.back()} />
        <PrimaryButton label="DELETE THIS DATE" variant="ghost" onPress={confirmDelete} />
      </View>

      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard ref={shareCardRef} session={session} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    marginTop: spacing.md,
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
