import { Effect } from 'effect';
import { getORCID } from '../context';
import { ContextStore, EventsStore, updateEventsStore } from '../store';
import { autocompleteMultiselect, events2options } from '../prompt';
import { getEvents, filterPending } from '../events';
import type { IEvent, Status } from '../events/types';

const updateEventStatusBasedOnAcceptedValues = (
  events: IEvent[],
  /** Accepted values from events */
  accepted: string[],
  opts: Partial<IEvent>,
): IEvent[] =>
  filterPending(events, opts).map(event => {
    const status: Status = accepted.includes(event.value) ? 'accepted' : 'rejected';
    return { ...event, status };
  });

const updateDate = (event: IEvent): IEvent => ({
  ...event,
  updatedAt: new Date().toISOString(),
});

const updateEventsStoreBasedOnAcceptedValues = (
  values: string[],
  opts: Partial<IEvent>,
): Effect.Effect<void, never, EventsStore> =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    const updated = updateEventStatusBasedOnAcceptedValues(events, values, opts).map(updateDate);
    yield* updateEventsStore(updated);
  });

const mark_alternative_strings_reliable = (
  message: string,
  opts: Partial<IEvent>,
): Effect.Effect<void, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    if (!opts.id) opts.id = yield* getORCID();
    const events = yield* getEvents();
    const filtered = filterPending(events, opts);
    const options = events2options(filtered);
    const selected = yield* autocompleteMultiselect(message, false, options);
    if (typeof selected === 'symbol') throw new Error('La sélection a été annulée');
    yield* updateEventsStoreBasedOnAcceptedValues(selected, opts);
  });

export { mark_alternative_strings_reliable };
