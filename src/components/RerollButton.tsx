import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing, touchTarget } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RerollButtonProps {
  rerollsRemaining: number;
  onReroll: () => void;
}

export function RerollButton({ rerollsRemaining, onReroll }: RerollButtonProps) {
  const disabled = rerollsRemaining <= 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reroll this mission. ${rerollsRemaining} rerolls remaining`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onReroll}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={styles.label}>🎲 Reroll · {rerollsRemaining}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
