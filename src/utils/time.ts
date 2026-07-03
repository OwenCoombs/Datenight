export function nowIso(): string {
  return new Date().toISOString();
}

/** Seconds remaining until an ISO timestamp; never below zero. */
export function secondsUntil(endsAtIso: string, now: number = Date.now()): number {
  const ends = new Date(endsAtIso).getTime();
  return Math.max(0, Math.round((ends - now) / 1000));
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "1h 42m" style duration between two ISO timestamps. */
export function formatDuration(startIso: string, endIso: string): string {
  const ms = Math.max(0, new Date(endIso).getTime() - new Date(startIso).getTime());
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
