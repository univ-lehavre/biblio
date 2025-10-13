import { Effect, Ref } from 'effect';
import { ContextStore, EventsStore, saveEventsStore } from '../store';
import type { IEvent } from '../events/types';
import type { IContext } from '../context/types';
import { filterDuplicates, getEvents, updateNewEventsWithExistingMetadata } from '../events';

/**
 * Updates the EventsStore with new events, ensuring no duplicates.
 * @param newEvents New events to add to the store
 * @returns An Effect that updates the EventsStore with the new events, ensuring no duplicates.
 */
const updateEventsStore = (
  newEvents: IEvent[],
): Effect.Effect<void, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const store = yield* EventsStore;
    const events = yield* getEvents();
    const expanded = updateNewEventsWithExistingMetadata(events, newEvents);
    const noDuplicates = filterDuplicates(events, expanded);
    yield* Ref.update(store, () => [...noDuplicates]);
    yield* saveEventsStore();
  });

const updateContextStore = (
  newContext: Partial<IContext>,
): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const store = yield* ContextStore;
    yield* Ref.update(store, state => ({ ...state, ...newContext }));
  });

export { updateEventsStore, updateContextStore };
