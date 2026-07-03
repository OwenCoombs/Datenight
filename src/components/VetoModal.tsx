import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { SelectionCard } from '@/components/SelectionCard';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Partner } from '@/types/date';

interface VetoModalProps {
  visible: boolean;
  partnerOneName: string;
  partnerTwoName: string;
  partnerOneVetoRemaining: number;
  partnerTwoVetoRemaining: number;
  onClose: () => void;
  /** avoidCategory: also block this kind of mission for the night. */
  onVeto: (partner: Partner, avoidCategory: boolean) => void;
}

export function VetoModal({
  visible,
  partnerOneName,
  partnerTwoName,
  partnerOneVetoRemaining,
  partnerTwoVetoRemaining,
  onClose,
  onVeto,
}: VetoModalProps) {
  const [partner, setPartner] = useState<Partner | null>(null);

  const reset = () => setPartner(null);
  const close = () => {
    reset();
    onClose();
  };
  const confirm = (avoidCategory: boolean) => {
    if (!partner) return;
    const chosen = partner;
    reset();
    onVeto(chosen, avoidCategory);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {partner === null ? (
            <>
              <Text style={typography.title}>WHO&apos;S USING THEIR VETO?</Text>
              <View style={styles.options}>
                {partnerOneVetoRemaining > 0 ? (
                  <SelectionCard
                    title={partnerOneName}
                    onPress={() => setPartner('partner_one')}
                  />
                ) : null}
                {partnerTwoVetoRemaining > 0 ? (
                  <SelectionCard
                    title={partnerTwoName}
                    onPress={() => setPartner('partner_two')}
                  />
                ) : null}
              </View>
              <PrimaryButton label="NEVER MIND" variant="ghost" onPress={close} />
            </>
          ) : (
            <>
              <Text style={typography.title}>NO PROBLEM.</Text>
              <View style={styles.options}>
                <SelectionCard
                  title="Give us something else"
                  onPress={() => confirm(false)}
                />
                <SelectionCard
                  title="Avoid this kind of mission tonight"
                  onPress={() => confirm(true)}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  options: {
    marginTop: spacing.sm,
  },
});
