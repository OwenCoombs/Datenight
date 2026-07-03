import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Partner } from '@/types/date';

interface PrivateHandoffProps {
  partnerOneName: string;
  partnerTwoName: string;
  /** Supporting copy under "TAKE THE PHONE". */
  prompt: string;
  /**
   * Render the private choice UI for one partner. Call `lockIn` when the
   * partner confirms — the value is hidden immediately afterward.
   */
  renderChoice: (partner: Partner, lockIn: () => void) => ReactNode;
  /** Fired after both partners have locked in. */
  onBothDone: () => void;
}

type Phase = 'p1_intro' | 'p1_choice' | 'p2_intro' | 'p2_choice';

/**
 * The single-device private choice flow:
 * partner one takes the phone → chooses privately → pass the phone →
 * partner two chooses privately → combined result (handled by caller).
 */
export function PrivateHandoff({
  partnerOneName,
  partnerTwoName,
  prompt,
  renderChoice,
  onBothDone,
}: PrivateHandoffProps) {
  const [phase, setPhase] = useState<Phase>('p1_intro');

  if (phase === 'p1_intro' || phase === 'p2_intro') {
    const isFirst = phase === 'p1_intro';
    const name = isFirst ? partnerOneName : partnerTwoName;
    return (
      <View style={styles.container}>
        {!isFirst ? <Text style={styles.pass}>PASS THE PHONE.</Text> : null}
        <Text style={typography.display}>
          {name.toUpperCase()}, {isFirst ? 'TAKE THE PHONE.' : 'YOUR TURN.'}
        </Text>
        <Text style={[typography.bodySecondary, styles.prompt]}>{prompt}</Text>
        <PrimaryButton
          label="I'M READY"
          haptic
          onPress={() => setPhase(isFirst ? 'p1_choice' : 'p2_choice')}
        />
      </View>
    );
  }

  const partner: Partner = phase === 'p1_choice' ? 'partner_one' : 'partner_two';
  const lockIn = () => {
    if (partner === 'partner_one') {
      setPhase('p2_intro');
    } else {
      onBothDone();
    }
  };

  return <View style={styles.container}>{renderChoice(partner, lockIn)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  pass: {
    ...typography.overline,
    fontSize: 16,
    letterSpacing: 2,
  },
  prompt: {
    marginBottom: spacing.md,
  },
});
