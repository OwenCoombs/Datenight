import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { SelectionCard } from '@/components/SelectionCard';
import { vibes } from '@/content/vibes';
import { getFinishedSessions, getActiveSession } from '@/db/sessionRepository';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';
import { formatDateLabel } from '@/utils/time';

export default function Home() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<DateSession | null>(null);
  const [history, setHistory] = useState<DateSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      setActiveSession(getActiveSession());
      setHistory(getFinishedSessions());
    }, []),
  );

  return (
    <Screen>
      {activeSession ? (
        <Card style={styles.activeCard}>
          <Text style={styles.activeKicker}>YOUR DATE IS STILL GOING</Text>
          <Text style={typography.heading}>The No-Plan Date</Text>
          <PrimaryButton
            label="CONTINUE DATE"
            haptic
            onPress={() => router.push(`/date/${activeSession.id}/play`)}
          />
        </Card>
      ) : null}

      <Text style={[typography.display, styles.heading]}>
        WHAT KIND OF NIGHT ARE WE HAVING?
      </Text>

      {vibes.map((vibe) => (
        <SelectionCard
          key={vibe.id}
          title={vibe.name}
          subtitle={vibe.description}
          emoji={vibe.emoji}
          disabled={!vibe.enabled}
          disabledTag="COMING SOON"
          onPress={() => {
            if (vibe.id === 'spontaneous') {
              router.push('/date/spontaneous');
            }
          }}
        />
      ))}

      {history.length > 0 ? (
        <View style={styles.historySection}>
          <Text style={typography.overline}>OUR DATES</Text>
          {history.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/history/${session.id}`)}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function HistoryCard({ session, onPress }: { session: DateSession; onPress: () => void }) {
  const primaryPhoto = session.photos[0];
  const primaryAward = session.awards?.[0];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`The No-Plan Date, ${
        session.completedAt ? formatDateLabel(session.completedAt) : ''
      }, score ${session.score ?? 0}`}
      onPress={onPress}
      style={({ pressed }) => [styles.historyCard, pressed && styles.historyPressed]}>
      {primaryPhoto ? (
        <Image source={{ uri: primaryPhoto.uri }} style={styles.historyPhoto} />
      ) : (
        <View style={[styles.historyPhoto, styles.historyPhotoEmpty]}>
          <Text style={styles.historyEmoji}>🎲</Text>
        </View>
      )}
      <View style={styles.historyText}>
        <Text style={typography.heading}>The No-Plan Date</Text>
        <Text style={typography.bodySecondary}>
          {session.completedAt ? formatDateLabel(session.completedAt) : ''}
        </Text>
        {primaryAward ? (
          <Text style={styles.historyAward}>{primaryAward.title}</Text>
        ) : null}
      </View>
      <Text style={styles.historyScore}>{session.score ?? 0}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  activeCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderColor: colors.accent,
  },
  activeKicker: {
    ...typography.overline,
    color: colors.accent,
  },
  historySection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  historyPressed: {
    backgroundColor: colors.surfacePressed,
  },
  historyPhoto: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  historyPhotoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmoji: {
    fontSize: 28,
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
  historyAward: {
    ...typography.caption,
    color: colors.gold,
  },
  historyScore: {
    ...typography.title,
    color: colors.accent,
  },
});
