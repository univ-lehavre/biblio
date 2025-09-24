import { Effect, Ref } from 'effect';
import { ContextStore, EventsStore } from '../store';
import type { IEvent } from '../events/types';
import type { IContext } from '../context/types';
import { filterDuplicates, getEvents } from '../events';

const updateEventsStoreWithNewEvents = (
  newEvents: IEvent[],
): Effect.Effect<void, never, EventsStore> =>
  Effect.gen(function* () {
    const store = yield* EventsStore;
    yield* Ref.update(store, events => [...events, ...newEvents]);
  });

/**
 *
 * @param newEvents Nouveaux événements à ajouter au store
 * @returns
 */
const updateEventsStore = (newEvents: IEvent[]): Effect.Effect<void, never, EventsStore> =>
  Effect.gen(function* () {
    const store = yield* EventsStore;
    const events = yield* getEvents();
    const noDuplicates = filterDuplicates(events, newEvents);
    yield* Ref.update(store, () => [...noDuplicates]);
  });

const updateContextStore = (
  newContext: Partial<IContext>,
): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const store = yield* ContextStore;
    yield* Ref.update(store, state => ({ ...state, ...newContext }));
  });

export { updateEventsStore, updateEventsStoreWithNewEvents, updateContextStore };
