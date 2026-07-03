import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ScreenProps extends PropsWithChildren {
  /** Scrollable content (default) or fixed layout. */
  scroll?: boolean;
  style?: ViewStyle;
  /** Centers content vertically — used for cinematic full-screen moments. */
  centered?: boolean;
}

export function Screen({ children, scroll = true, style, centered = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.lg,
    paddingHorizontal: spacing.screenX,
  };

  if (!scroll) {
    return (
      <View
        style={[styles.root, padding, centered && styles.centered, style]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[padding, centered && styles.centeredScroll, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
