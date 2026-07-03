import { Image, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { countRerollsUsed, countCompletedRounds, countVetoesUsed } from '@/engine/scoring';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DateSession } from '@/types/date';
import { formatDateLabel, formatDuration } from '@/utils/time';

/** On-screen recap: stats, awards, primary memory photo. */
export function RecapCard({ session }: { session: DateSession }) {
  const stats = buildRecapStats(session);
  const primaryPhoto = session.photos[0];

  return (
    <View style={styles.stack}>
      <Card style={styles.card}>
        <Text style={styles.experience}>THE NO-PLAN DATE</Text>
        <Text style={styles.names}>
          {session.partnerOneName} + {session.partnerTwoName}
        </Text>

        <View style={styles.scoreBlock}>
          <Text style={styles.score}>{session.score ?? 0}</Text>
          <Text style={typography.overline}>SPONTANEITY SCORE</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map(([label, value]) => (
            <View key={label} style={styles.statRow}>
              <Text style={typography.bodySecondary}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Card>

      {session.awards && session.awards.length > 0 ? (
        <Card style={styles.card}>
          <Text style={typography.overline}>TONIGHT&apos;S AWARDS</Text>
          {session.awards.map((award) => (
            <View key={award.id} style={styles.award}>
              <Text style={styles.awardTitle}>{award.title}</Text>
              <Text style={typography.bodySecondary}>
                {award.recipient === 'both'
                  ? 'Both of you'
                  : award.recipient === 'partner_one'
                    ? session.partnerOneName
                    : session.partnerTwoName}
                {' — '}
                {award.description}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {primaryPhoto ? (
        <Image
          source={{ uri: primaryPhoto.uri }}
          style={styles.photo}
          accessibilityLabel="Memory from tonight"
        />
      ) : null}
    </View>
  );
}

export function buildRecapStats(session: DateSession): [string, string][] {
  const stats: [string, string][] = [];
  if (session.completedAt) {
    stats.push(['Date', formatDateLabel(session.completedAt)]);
  }
  if (session.startedAt && session.completedAt) {
    stats.push(['Time together', formatDuration(session.startedAt, session.completedAt)]);
  }
  stats.push(['Rounds completed', `${countCompletedRounds(session)} of 4`]);
  stats.push(['Photos captured', String(session.photos.length)]);
  stats.push(['Rerolls used', String(countRerollsUsed(session))]);
  stats.push(['Vetoes used', String(countVetoesUsed(session))]);
  return stats;
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  experience: {
    ...typography.overline,
    color: colors.accent,
  },
  names: {
    ...typography.title,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  score: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: -2,
  },
  statsGrid: {
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
  },
  award: {
    gap: 2,
  },
  awardTitle: {
    ...typography.heading,
    color: colors.gold,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
