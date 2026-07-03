import { StyleSheet, Text, View } from 'react-native';

import { usePersistentTimer } from '@/hooks/usePersistentTimer';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatClock } from '@/utils/time';

interface TimerProps {
  timerEndsAt: string | null;
  /** Shown when the timer reaches zero. */
  doneLabel?: string;
}

export function PersistentTimer({ timerEndsAt, doneLabel = "TIME'S UP" }: TimerProps) {
  const { remainingSeconds, isDone } = usePersistentTimer(timerEndsAt);

  if (!timerEndsAt) return null;

  return (
    <View
      style={[styles.container, isDone && styles.doneContainer]}
      accessibilityRole="timer"
      accessibilityLabel={
        isDone ? 'Timer finished' : `${formatClock(remainingSeconds)} remaining`
      }>
      <Text style={[styles.clock, isDone && styles.doneText]}>
        {isDone ? doneLabel : formatClock(remainingSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneContainer: {
    borderColor: colors.success,
  },
  clock: {
    ...typography.title,
    fontVariant: ['tabular-nums'],
  },
  doneText: {
    color: colors.success,
    fontSize: 20,
    letterSpacing: 2,
  },
});
