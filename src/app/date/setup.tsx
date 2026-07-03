import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SelectionCard } from '@/components/SelectionCard';
import { budgetOptions, timeOptions } from '@/content/options';
import { getCoupleProfile } from '@/db/profileRepository';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BudgetOption, TimeOption, TransportMode } from '@/types/date';

type Step = 'time' | 'budget' | 'transport' | 'driver';

/** One decision per screen: time → budget → transport (→ driver). */
export default function DateSetup() {
  const router = useRouter();
  const profile = getCoupleProfile();
  const [step, setStep] = useState<Step>('time');
  const [timeOption, setTimeOption] = useState<TimeOption | null>(null);
  const [budgetOption, setBudgetOption] = useState<BudgetOption | null>(null);

  const partnerOneName = profile?.partnerOneName ?? 'Partner One';
  const partnerTwoName = profile?.partnerTwoName ?? 'Partner Two';

  const goToBoundaries = (transportMode: TransportMode, driverName?: string) => {
    if (!timeOption || !budgetOption) return;
    router.push({
      pathname: '/date/boundaries',
      params: {
        timeOption,
        budgetOption,
        transportMode,
        driverName: driverName ?? '',
      },
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.overline}>DATE SETUP</Text>
        {step === 'time' ? (
          <Text style={typography.display}>HOW MUCH TIME DO WE HAVE?</Text>
        ) : step === 'budget' ? (
          <Text style={typography.display}>WHAT ARE WE SPENDING?</Text>
        ) : step === 'transport' ? (
          <Text style={typography.display}>HOW ARE WE GETTING AROUND?</Text>
        ) : (
          <Text style={typography.display}>WHO&apos;S DRIVING?</Text>
        )}
      </View>

      {step === 'time'
        ? timeOptions.map((option) => (
            <SelectionCard
              key={option.id}
              title={option.title}
              subtitle={option.subtitle}
              onPress={() => {
                setTimeOption(option.id);
                setStep('budget');
              }}
            />
          ))
        : null}

      {step === 'budget'
        ? budgetOptions.map((option) => (
            <SelectionCard
              key={option.id}
              title={option.title}
              subtitle={option.subtitle}
              onPress={() => {
                setBudgetOption(option.id);
                setStep('transport');
              }}
            />
          ))
        : null}

      {step === 'transport' ? (
        <>
          <SelectionCard title="Driving" emoji="🚗" onPress={() => setStep('driver')} />
          <SelectionCard title="Walking" emoji="🚶" onPress={() => goToBoundaries('walking')} />
        </>
      ) : null}

      {step === 'driver' ? (
        <>
          <SelectionCard
            title={partnerOneName}
            onPress={() => goToBoundaries('driving', partnerOneName)}
          />
          <SelectionCard
            title={partnerTwoName}
            onPress={() => goToBoundaries('driving', partnerTwoName)}
          />
        </>
      ) : null}

      <PrimaryButton
        label="BACK"
        variant="ghost"
        onPress={() => {
          if (step === 'time') router.back();
          else if (step === 'budget') setStep('time');
          else if (step === 'transport') setStep('budget');
          else setStep('transport');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
