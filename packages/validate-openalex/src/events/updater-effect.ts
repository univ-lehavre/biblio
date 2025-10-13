import { ConfigError, Effect } from 'effect';
import { getEvents } from './getter-effect';
import { ContextStore, EventsStore, updateEventsStore } from '../store';
import { filterPending } from './filter';
import type { IEvent, Status } from './types';

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
): Effect.Effect<void, Error | ConfigError.ConfigError, EventsStore | ContextStore> =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    const updated = updateEventStatusBasedOnAcceptedValues(events, values, opts).map(updateDate);
    yield* updateEventsStore(updated);
  });

export { updateEventsStoreBasedOnAcceptedValues };
