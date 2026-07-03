import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Interactive coin for The Coin-Flip Route. Heads = left, tails = right. */
export function CoinFlip() {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [flipping, setFlipping] = useState(false);
  // Animated value and its interpolation are created once, render-safely.
  const [{ spin, rotateX }] = useState(() => {
    const value = new Animated.Value(0);
    return {
      spin: value,
      rotateX: value.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1440deg'],
      }),
    };
  });
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    spin.setValue(0);
    Animated.timing(spin, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (!mounted.current) return;
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(outcome);
      setFlipping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          result
            ? `Coin shows ${result}. ${result === 'heads' ? 'Turn left' : 'Turn right'}. Tap to flip again`
            : 'Flip the coin'
        }
        onPress={flip}>
        <Animated.View style={[styles.coin, { transform: [{ rotateX }] }]}>
          <Text style={styles.coinFace}>{result === null ? '?' : result === 'heads' ? 'H' : 'T'}</Text>
        </Animated.View>
      </Pressable>
      <Text style={styles.resultText}>
        {flipping
          ? '...'
          : result === 'heads'
            ? 'HEADS — TURN LEFT'
            : result === 'tails'
              ? 'TAILS — TURN RIGHT'
              : 'TAP THE COIN TO FLIP'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  coin: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#D9A62E',
  },
  coinFace: {
    fontSize: 40,
    fontWeight: '900',
    color: '#5C4508',
  },
  resultText: {
    ...typography.overline,
    color: colors.textPrimary,
  },
});
