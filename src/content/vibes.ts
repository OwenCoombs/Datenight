import { Vibe } from '@/types/date';

export const vibes: Vibe[] = [
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🛋️',
    description: 'Easy. Cozy. No big effort.',
    enabled: false,
  },
  {
    id: 'fun',
    name: 'Fun',
    emoji: '🎉',
    description: 'Laugh first. Plan later.',
    enabled: false,
  },
  {
    id: 'spontaneous',
    name: 'Spontaneous',
    emoji: '🎲',
    description: "You won't know what's next.",
    enabled: true,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '🌙',
    description: 'Make tonight feel intentional.',
    enabled: false,
  },
  {
    id: 'wild',
    name: 'Wild',
    emoji: '🔥',
    description: 'Outside the usual routine.',
    enabled: false,
  },
  {
    id: 'deep',
    name: 'Deep',
    emoji: '🌊',
    description: 'Less small talk.',
    enabled: false,
  },
];
