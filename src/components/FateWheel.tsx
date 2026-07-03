import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface FateWheelProps {
  options: readonly string[];
  /** Fired once the wheel lands. */
  onResult?: (option: string) => void;
}

/**
 * Random picker that cycles through options, slowing down until it lands.
 */
export function FateWheel({ options, onResult }: FateWheelProps) {
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setLanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const target = Math.floor(Math.random() * options.length);
    // Enough steps for at least two full loops before landing on target.
    const currentIndex = index;
    const stepsToTarget =
      options.length * 2 + ((target - currentIndex + options.length) % options.length);

    let step = 0;
    const advance = (position: number) => {
      setIndex(position % options.length);
      step += 1;
      if (step > stepsToTarget) {
        setSpinning(false);
        setLanded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onResult?.(options[position % options.length]);
        return;
      }
      // Ease out: delays grow as the wheel approaches the target.
      const progress = step / stepsToTarget;
      const delay = 50 + progress * progress * 300;
      timeoutRef.current = setTimeout(() => advance(position + 1), delay);
    };
    advance(currentIndex + 1);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.window, landed && styles.windowLanded]}>
        <Text
          style={styles.option}
          accessibilityLabel={landed ? `Fate chose ${options[index]}` : options[index]}>
          {options[index].toUpperCase()}
        </Text>
      </View>
      <PrimaryButton
        label={landed ? 'SPIN AGAIN' : spinning ? '...' : 'SPIN THE WHEEL'}
        variant={landed ? 'secondary' : 'primary'}
        disabled={spinning}
        onPress={spin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  window: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  windowLanded: {
    borderColor: colors.gold,
  },
  option: {
    ...typography.title,
    textAlign: 'center',
  },
});
