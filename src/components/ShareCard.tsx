import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { countCompletedRounds, countRerollsUsed, countVetoesUsed } from '@/engine/scoring';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { DateSession } from '@/types/date';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640; // 9:16

/**
 * The vertical share card, rendered offscreen and captured with
 * react-native-view-shot. Branding stays subtle.
 */
export const ShareCard = forwardRef<View, { session: DateSession }>(
  function ShareCard({ session }, ref) {
    const photo = session.photos[0];
    const award = session.awards?.[0];
    const newExperiences = session.completedMissionIds.length;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <Text style={styles.headline}>WE LET AN APP{'\n'}CONTROL OUR DATE</Text>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>SPONTANEITY SCORE</Text>
          <Text style={styles.score}>{session.score ?? 0}</Text>
        </View>

        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.fallbackDice}>🎲</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Text style={styles.stat}>{countCompletedRounds(session)} rounds</Text>
          <Text style={styles.stat}>{newExperiences} new experiences</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{countRerollsUsed(session)} rerolls</Text>
          <Text style={styles.stat}>{countVetoesUsed(session)} vetoes</Text>
        </View>

        {award ? (
          <View style={styles.awardBlock}>
            <Text style={styles.awardLabel}>TONIGHT&apos;S AWARD</Text>
            <Text style={styles.awardTitle}>{award.title}</Text>
          </View>
        ) : null}

        <Text style={styles.branding}>🎲 the no-plan date</Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  headline: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  scoreBlock: {
    gap: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
  score: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: -2,
  },
  photo: {
    width: '100%',
    flex: 1,
    marginVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackDice: {
    fontSize: 64,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  stat: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  awardBlock: {
    marginTop: spacing.sm,
    gap: 2,
  },
  awardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
  awardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.accent,
  },
  branding: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textTertiary,
  },
});
