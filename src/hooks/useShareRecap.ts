import * as Sharing from 'expo-sharing';
import { RefObject, useState } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Captures the offscreen share card as a real image file and opens the
 * native iOS share sheet. Never throws into the UI — failures surface as
 * a friendly message.
 */
export function useShareRecap(cardRef: RefObject<View | null>) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = async () => {
    setError(null);
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setError("Sharing isn't available right now.");
        return;
      }
      if (!cardRef.current) {
        setError("Sharing isn't available right now.");
        return;
      }
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        fileName: 'date-night-recap',
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share our night',
      });
    } catch {
      setError("Sharing isn't available right now.");
    } finally {
      setSharing(false);
    }
  };

  return { share, sharing, error };
}
