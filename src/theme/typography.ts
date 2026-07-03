import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Big cinematic headings use heavy weights and tight tracking.
 * Body copy stays readable at night.
 */
export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  } satisfies TextStyle,
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  } satisfies TextStyle,
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textPrimary,
  } satisfies TextStyle,
  bodySecondary: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.textSecondary,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: colors.textTertiary,
  } satisfies TextStyle,
  /** Small all-caps label, e.g. "ROUND ONE". */
  overline: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  } satisfies TextStyle,
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: colors.onAccent,
  } satisfies TextStyle,
} as const;
