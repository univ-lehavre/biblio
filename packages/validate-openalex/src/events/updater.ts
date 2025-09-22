import { Effect } from 'effect';
import { getEvents } from './getter';
import { filterDuplicates, filterPending } from './filter';
import type { IEvent, Status } from './types';
import { updateEventsStore } from '../store';

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

const updateEventsStoreBasedOnAcceptedValues = (values: string[], opts: Partial<IEvent>) =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    const updated = updateEventStatusBasedOnAcceptedValues(events, values, opts).map(updateDate);
    const noDuplicates = filterDuplicates(events, updated);
    yield* updateEventsStore(noDuplicates);
  });

export { updateEventsStoreBasedOnAcceptedValues };
