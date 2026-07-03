import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProgressIndicatorProps {
  /** Current round, 1-based. */
  current: number;
  total?: number;
}

/**
 * Four abstract markers — shows progress without revealing what's ahead.
 */
export function ProgressIndicator({ current, total = 4 }: ProgressIndicatorProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Round ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const round = index + 1;
        const state = round < current ? 'done' : round === current ? 'active' : 'future';
        return (
          <View
            key={round}
            style={[
              styles.dot,
              state === 'done' && styles.done,
              state === 'active' && styles.active,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfacePressed,
  },
  done: {
    backgroundColor: colors.textTertiary,
  },
  active: {
    backgroundColor: colors.accent,
    width: 24,
    borderRadius: 5,
  },
});
