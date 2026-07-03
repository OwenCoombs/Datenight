import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { secondsUntil } from '@/utils/time';

/**
 * Wall-clock timer. Remaining time is always derived from `timerEndsAt`
 * minus the current time, so it stays accurate through backgrounding,
 * screen locks, and process restarts.
 */
export function usePersistentTimer(timerEndsAt: string | null) {
  // Only exists to trigger a re-render every second; remaining time is
  // recomputed from the wall clock on each render.
  const [, forceTick] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!timerEndsAt) return;

    firedRef.current = secondsUntil(timerEndsAt) === 0;

    const tick = () => {
      forceTick((t) => t + 1);
      if (secondsUntil(timerEndsAt) === 0 && !firedRef.current) {
        firedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [timerEndsAt]);

  const remaining = timerEndsAt ? secondsUntil(timerEndsAt) : 0;

  return {
    remainingSeconds: remaining,
    isRunning: timerEndsAt !== null && remaining > 0,
    isDone: timerEndsAt !== null && remaining === 0,
  };
}
