import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Small tag shown when disabled, e.g. "COMING SOON". */
  disabledTag?: string;
  onPress: () => void;
}

export function SelectionCard({
  title,
  subtitle,
  emoji,
  selected = false,
  disabled = false,
  disabledTag,
  onPress,
}: SelectionCardProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <View style={styles.row}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={[typography.heading, disabled && styles.mutedText]}>{title}</Text>
            {disabled && disabledTag ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{disabledTag}</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text style={[typography.bodySecondary, styles.subtitle]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabled: {
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 32,
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  subtitle: {
    marginTop: 2,
  },
  mutedText: {
    color: colors.textSecondary,
  },
  tag: {
    backgroundColor: colors.surfacePressed,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});
