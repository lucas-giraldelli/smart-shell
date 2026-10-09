import { config } from './config.js';

// Event categories: what an event is about decides its icon and how the pets
// react. An event's category comes from its calendar (config
// events.categories.calendars) or, failing that, from keywords in its title
// (events.categories.keywords); anything else is "personal".
export const categories = {
  work: { icon: 'briefcase' },
  health: { icon: 'stethoscope' },
  personal: { icon: 'user' },
};

// accent- and case-insensitive, so "Psicólogo" matches "psicologo"
const fold = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function categoryOf(event) {
  const rules = config.events?.categories ?? {};
  const byCalendar = rules.calendars ?? {};
  for (const cal of event.calendars ?? []) {
    if (byCalendar[cal]) return byCalendar[cal];
  }
  const title = fold(event.title ?? '');
  for (const [category, words] of Object.entries(rules.keywords ?? {})) {
    if (words.some(w => title.includes(fold(w)))) return category;
  }
  return 'personal';
}
