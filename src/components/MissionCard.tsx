import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Mission } from '@/types/date';

interface MissionCardProps extends PropsWithChildren {
  mission: Mission;
}

/** The mission dominates the screen: kicker, big title, instructions. */
export function MissionCard({ mission, children }: MissionCardProps) {
  return (
    <Card style={styles.card}>
      {mission.kicker ? <Text style={styles.kicker}>{mission.kicker}</Text> : null}
      <Text style={styles.title}>{mission.title.toUpperCase()}</Text>
      <View style={styles.body}>
        {mission.body.map((paragraph, index) => (
          <Text key={index} style={typography.body}>
            {paragraph}
          </Text>
        ))}
      </View>
      {children ? <View style={styles.extra}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  kicker: {
    ...typography.overline,
    color: colors.accent,
  },
  title: {
    ...typography.title,
  },
  body: {
    gap: spacing.md,
  },
  extra: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
