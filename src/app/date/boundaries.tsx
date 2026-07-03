import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { PrivateHandoff } from '@/components/PrivateHandoff';
import { Screen } from '@/components/Screen';
import { SelectionCard } from '@/components/SelectionCard';
import { boundaryOptions } from '@/content/options';
import { getCoupleProfile } from '@/db/profileRepository';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BoundaryKey, Partner } from '@/types/date';

/**
 * Private boundaries flow. Each partner selects privately on the shared
 * phone; only the merged union continues into the session. The app never
 * shows who blocked what.
 */
export default function Boundaries() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    timeOption: string;
    budgetOption: string;
    transportMode: string;
    driverName: string;
  }>();

  const profile = getCoupleProfile();
  const partnerOneName = profile?.partnerOneName ?? 'Partner One';
  const partnerTwoName = profile?.partnerTwoName ?? 'Partner Two';

  // Kept separate per partner and never rendered after lock-in.
  const [partnerOnePicks, setPartnerOnePicks] = useState<BoundaryKey[]>([]);
  const [partnerTwoPicks, setPartnerTwoPicks] = useState<BoundaryKey[]>([]);
  const [merged, setMerged] = useState(false);

  const togglePick = (partner: Partner, key: BoundaryKey) => {
    const setter = partner === 'partner_one' ? setPartnerOnePicks : setPartnerTwoPicks;
    setter((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  };

  const continueToReady = () => {
    const union = Array.from(new Set([...partnerOnePicks, ...partnerTwoPicks]));
    router.push({
      pathname: '/date/ready',
      params: { ...params, blockedBoundaries: union.join(',') },
    });
  };

  if (merged) {
    return (
      <Screen scroll={false} centered>
        <View style={styles.done}>
          <Text style={typography.display}>GOT IT.</Text>
          <Text style={typography.bodySecondary}>
            Tonight is built around both of you.
          </Text>
        </View>
        <PrimaryButton label="CONTINUE" haptic onPress={continueToReady} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <PrivateHandoff
        partnerOneName={partnerOneName}
        partnerTwoName={partnerTwoName}
        prompt={"Pick anything you'd rather skip tonight.\nYour choices stay private."}
        onBothDone={() => setMerged(true)}
        renderChoice={(partner, lockIn) => (
          <BoundaryPicker
            picks={partner === 'partner_one' ? partnerOnePicks : partnerTwoPicks}
            onToggle={(key) => togglePick(partner, key)}
            onLockIn={lockIn}
          />
        )}
      />
    </Screen>
  );
}

function BoundaryPicker({
  picks,
  onToggle,
  onLockIn,
}: {
  picks: BoundaryKey[];
  onToggle: (key: BoundaryKey) => void;
  onLockIn: () => void;
}) {
  return (
    <View style={styles.picker}>
      <Text style={[typography.title, styles.pickerTitle]}>
        ANYTHING YOU&apos;D RATHER SKIP TONIGHT?
      </Text>
      <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
        {boundaryOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            selected={picks.includes(option.id)}
            onPress={() => onToggle(option.id)}
          />
        ))}
      </ScrollView>
      <PrimaryButton label="LOCK IN MY CHOICES" haptic onPress={onLockIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  done: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  picker: {
    flex: 1,
  },
  pickerTitle: {
    marginBottom: spacing.md,
  },
  pickerList: {
    flex: 1,
  },
});
