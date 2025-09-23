import { Effect } from 'effect';
import { getORCID } from '../context';
import { ContextStore, EventsStore } from '../store';
import { autocompleteMultiselect, event2option } from '../prompt';
import { updateEventsStoreBasedOnAcceptedValues, getEvents, filterPending } from '../events';
import type { IEvent } from '../events/types';

const mark_alternative_strings_reliable = (
  message: string,
  opts: Partial<IEvent>,
): Effect.Effect<void, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    if (!opts.id) opts.id = yield* getORCID();
    const events = yield* getEvents();
    const filtered = filterPending(events, opts);

    const seen = new Set<string>();
    const uniques = [];
    for (const event of filtered) {
      if (seen.has(event.value)) continue;
      seen.add(event.value);
      uniques.push(event);
    }

    const options = uniques
      .map(event2option)
      .sort((a, b) =>
        a.label && b.label ? a.label.localeCompare(b.label) : a.value.localeCompare(b.value),
      );
    const selected = yield* autocompleteMultiselect(message, false, options);
    if (selected instanceof Array) {
      yield* updateEventsStoreBasedOnAcceptedValues(selected, opts);
    }
  });

export { mark_alternative_strings_reliable };
