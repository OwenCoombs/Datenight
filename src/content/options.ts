import { BoundaryKey, BudgetOption, TimeOption } from '@/types/date';

export const timeOptions: { id: TimeOption; title: string; subtitle: string }[] = [
  { id: 'quick', title: 'Quick', subtitle: '45–75 minutes' },
  { id: 'few_hours', title: 'A Few Hours', subtitle: '1.5–3 hours' },
  { id: 'free_tonight', title: "We're Free Tonight", subtitle: 'No rush' },
];

export const budgetOptions: { id: BudgetOption; title: string; subtitle: string }[] = [
  { id: 'basically_nothing', title: 'Basically Nothing', subtitle: '$0–$10' },
  { id: 'keep_it_cheap', title: 'Keep It Cheap', subtitle: 'Under $30' },
  { id: 'spend_a_little', title: 'We Can Spend a Little', subtitle: 'Under $75' },
  { id: 'open_budget', title: 'Whatever Happens', subtitle: 'No strict budget' },
];

export const boundaryOptions: { id: BoundaryKey; label: string }[] = [
  { id: 'talking_to_strangers', label: 'Talking to strangers' },
  { id: 'buying_things', label: 'Buying things' },
  { id: 'food', label: 'Food' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'physical_activity', label: 'Physical activity' },
  { id: 'being_photographed', label: 'Being photographed' },
  { id: 'crowded_places', label: 'Crowded places' },
  { id: 'outdoor_activities', label: 'Outdoor activities' },
];
