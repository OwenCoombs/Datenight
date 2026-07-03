import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useDateSession } from '@/hooks/useDateSession';
import { getCoupleProfile } from '@/db/profileRepository';
import { getActiveSession } from '@/db/sessionRepository';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BoundaryKey, BudgetOption, TimeOption, TransportMode } from '@/types/date';

const rules = [
  'You only see one mission at a time.',
  'You both get one no-questions-asked veto.',
  "Don't search ahead.",
];

export default function ReadyScreen() {
  const router = useRouter();
  const { createSession, startDate } = useDateSession();
  const params = useLocalSearchParams<{
    timeOption: string;
    budgetOption: string;
    transportMode: string;
    driverName: string;
    blockedBoundaries: string;
  }>();

  const [countdown, setCountdown] = useState<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const transportMode = (params.transportMode as TransportMode) ?? 'walking';

  const begin = () => {
    // Never silently create a new session over an active one.
    const existing = getActiveSession();
    if (existing) {
      router.replace(`/date/${existing.id}/play`);
      return;
    }

    const profile = getCoupleProfile();
    const partnerOneName = profile?.partnerOneName ?? 'Partner One';
    const partnerTwoName = profile?.partnerTwoName ?? 'Partner Two';
    const driverName = params.driverName || undefined;
    const passengerName =
      transportMode === 'driving' && driverName
        ? driverName === partnerOneName
          ? partnerTwoName
          : partnerOneName
        : undefined;

    const session = createSession({
      partnerOneName,
      partnerTwoName,
      timeOption: (params.timeOption as TimeOption) ?? 'few_hours',
      budgetOption: (params.budgetOption as BudgetOption) ?? 'keep_it_cheap',
      transportMode,
      driverName,
      passengerName,
      blockedBoundaries: params.blockedBoundaries
        ? (params.blockedBoundaries.split(',') as BoundaryKey[])
        : [],
    });
    sessionIdRef.current = session.id;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      startDate();
      const id = sessionIdRef.current;
      if (id) {
        router.replace(`/date/${id}/play`);
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const timeout = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 900);
    return () => clearTimeout(timeout);
  }, [countdown, router, startDate]);

  if (countdown !== null) {
    return (
      <Screen scroll={false} centered>
        <Text
          style={styles.countdown}
          accessibilityLabel={countdown > 0 ? `Starting in ${countdown}` : 'Go'}>
          {countdown > 0 ? countdown : '🎲'}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} centered>
      <View style={styles.content}>
        <Text style={typography.overline}>THE NO-PLAN DATE</Text>
        <Text style={typography.display}>THREE RULES</Text>

        <View style={styles.rules}>
          {rules.map((rule, index) => (
            <View key={rule} style={styles.rule}>
              <Text style={styles.ruleNumber}>{index + 1}</Text>
              <Text style={[typography.body, styles.ruleText]}>{rule}</Text>
            </View>
          ))}
        </View>

        {transportMode === 'driving' ? (
          <Text style={styles.driverWarning}>
            The driver never uses the app while driving.
          </Text>
        ) : null}
      </View>

      <PrimaryButton label="READY TO GIVE UP CONTROL?" haptic onPress={begin} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  rules: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  rule: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  ruleNumber: {
    ...typography.title,
    color: colors.accent,
    width: 28,
  },
  ruleText: {
    flex: 1,
    fontSize: 19,
    lineHeight: 26,
  },
  driverWarning: {
    ...typography.body,
    color: colors.gold,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 120,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
