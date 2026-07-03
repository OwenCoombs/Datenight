import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const facts: [string, string][] = [
  ['Best for', '1–3 hours'],
  ['Energy', 'Medium'],
  ['Planning required', 'None'],
  ['Chance of chaos', 'High'],
];

export default function SpontaneousDetail() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.dice}>🎲</Text>
        <Text style={typography.display}>THE NO-PLAN DATE</Text>
        <Text style={typography.bodySecondary}>
          Give up the plan.{'\n'}You&apos;ll only see one step at a time.
        </Text>
      </View>

      <Card style={styles.facts}>
        {facts.map(([label, value]) => (
          <View key={label} style={styles.factRow}>
            <Text style={typography.bodySecondary}>{label}</Text>
            <Text style={styles.factValue}>{value}</Text>
          </View>
        ))}
      </Card>

      <PrimaryButton
        label="START A SPONTANEOUS DATE"
        haptic
        onPress={() => router.push('/date/setup')}
      />
      <PrimaryButton label="BACK" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dice: {
    fontSize: 48,
  },
  facts: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
