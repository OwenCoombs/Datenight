import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { saveCoupleProfile } from '@/db/profileRepository';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'names'>('welcome');
  const [yourName, setYourName] = useState('');
  const [theirName, setTheirName] = useState('');

  const canContinue = yourName.trim().length > 0 && theirName.trim().length > 0;

  const finish = () => {
    if (!canContinue) return;
    saveCoupleProfile(yourName.trim(), theirName.trim());
    router.replace('/home');
  };

  if (step === 'welcome') {
    return (
      <Screen scroll={false} centered>
        <View style={styles.welcome}>
          <Text style={styles.dice}>🎲</Text>
          <Text style={typography.display}>YOUR DATE NIGHT JUST GOT INTERESTING.</Text>
          <Text style={typography.bodySecondary}>
            Pick the vibe. We&apos;ll take it from there.
          </Text>
        </View>
        <PrimaryButton label="GET STARTED" haptic onPress={() => setStep('names')} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll={false} centered>
        <View style={styles.form}>
          <Text style={typography.display}>WHO&apos;S PLAYING?</Text>
          <View style={styles.inputs}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
              value={yourName}
              onChangeText={setYourName}
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Your name"
            />
            <TextInput
              style={styles.input}
              placeholder="Their name"
              placeholderTextColor={colors.textTertiary}
              value={theirName}
              onChangeText={setTheirName}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={finish}
              accessibilityLabel="Their name"
            />
          </View>
          <PrimaryButton label="LET'S GO" haptic disabled={!canContinue} onPress={finish} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  welcome: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  dice: {
    fontSize: 56,
  },
  form: {
    gap: spacing.xl,
  },
  inputs: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
});
