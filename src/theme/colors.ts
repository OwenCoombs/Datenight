export const colors = {
  /** App background — near-black with a hint of blue. */
  background: '#0B0B10',
  /** Elevated surfaces: cards, sheets. */
  surface: '#16161F',
  surfaceRaised: '#1E1E2A',
  surfacePressed: '#262634',
  border: '#2C2C3C',

  textPrimary: '#F5F5F7',
  textSecondary: '#A0A0B2',
  textTertiary: '#6C6C80',

  /** Primary action — hot magenta, reads "nightlife", not "valentine". */
  accent: '#FF3B6B',
  accentPressed: '#D92B56',
  onAccent: '#FFFFFF',

  /** Secondary accent for score / success moments. */
  gold: '#FFC94A',
  success: '#4ADE80',
  danger: '#FF5C5C',

  /** Dimmed overlay behind modals. */
  overlay: 'rgba(4, 4, 8, 0.82)',
} as const;

export type AppColor = keyof typeof colors;
