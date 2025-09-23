import type { Action } from '../actions/types';
import type { IEvent } from '../events/types';
import type { Option } from './types';

const action2option = (action: Action): Option<string> => ({ value: action.name });

const event2option = (
  event: Partial<IEvent> & { value: string; label?: string },
): Option<string> => ({
  value: event.value,
  label: event.label,
});

type EventWithValue = Partial<IEvent> & { value: string };

const filterUniqueValues = (events: EventWithValue[]): EventWithValue[] => {
  const seen = new Set<string>();
  const uniques = [];
  for (const event of events) {
    if (seen.has(event.value)) continue;
    seen.add(event.value);
    uniques.push(event);
  }
  return uniques;
};

const sortOptions = (a: { label?: string; value: string }, b: { label?: string; value: string }) =>
  a.label && b.label ? a.label.localeCompare(b.label) : a.value.localeCompare(b.value);

/**
 * Convertit une liste d'événements en options pour les prompts.
 * @param events Liste d'événements à convertir
 * @returns Des options triées (label ou value) et sans doublons
 */
const events2options = (
  events: (Partial<IEvent> & { value: string; label?: string })[],
): Option<string>[] => {
  const uniques = filterUniqueValues(events);
  const options = uniques.map(event2option).sort(sortOptions);
  return options;
};

const string2option = (value: string): Option<string> => ({ value });

const strings2options = (strings: string[]): Option<string>[] => strings.map(string2option);

export { strings2options, string2option, action2option, events2options };
