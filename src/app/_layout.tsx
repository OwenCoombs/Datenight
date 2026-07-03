import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DateSessionProvider } from '@/context/DateSessionContext';
import { getDatabase } from '@/db/database';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Database opens synchronously on first render; failure gives a real
  // error state instead of a permanent loading screen.
  const [dbStatus] = useState<'ready' | 'error'>(() => {
    try {
      getDatabase();
      return 'ready';
    } catch {
      return 'error';
    }
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (dbStatus === 'error') {
    return (
      <View style={styles.errorScreen}>
        <StatusBar style="light" />
        <Text style={typography.title}>SOMETHING BROKE ON OUR END.</Text>
        <Text style={[typography.bodySecondary, styles.errorBody]}>
          The app couldn&apos;t open its local storage. Try force-quitting and reopening the
          app. Your previous dates are safe.
        </Text>
      </View>
    );
  }

  return (
    <DateSessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </DateSessionProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorBody: {
    marginTop: spacing.sm,
  },
});
