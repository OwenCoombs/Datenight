import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PhotoCaptureProps {
  /** Called with the temporary camera URI once a photo is taken. */
  onPhoto: (tempUri: string) => void;
  onSkip: () => void;
  takeLabel?: string;
  skipLabel?: string;
}

/**
 * Camera capture with lazy permission request. Denial never blocks the
 * date — the couple can always continue without a photo.
 */
export function PhotoCapture({
  onPhoto,
  onSkip,
  takeLabel = 'TAKE PHOTO',
  skipLabel = 'SKIP PHOTO',
}: PhotoCaptureProps) {
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const takePhoto = async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setDenied(true);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPreviewUri(result.assets[0].uri);
        onPhoto(result.assets[0].uri);
      }
    } catch {
      setDenied(true);
    } finally {
      setBusy(false);
    }
  };

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: previewUri }}
          style={styles.preview}
          accessibilityLabel="Photo you just took"
        />
        <Text style={[typography.bodySecondary, styles.savedText]}>Saved to tonight.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {denied ? (
        <Text style={[typography.bodySecondary, styles.deniedText]}>
          Camera access is off. No problem — you can keep playing without a photo.
        </Text>
      ) : null}
      {!denied ? (
        <PrimaryButton label={takeLabel} onPress={takePhoto} loading={busy} haptic />
      ) : null}
      <PrimaryButton label={denied ? 'CONTINUE' : skipLabel} variant="secondary" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  savedText: {
    textAlign: 'center',
  },
  deniedText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
