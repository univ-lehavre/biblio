import { Effect, Ref } from 'effect';
import { ContextStore, EventsStore } from '../store';
import type { IEvent } from '../events/types';
import type { IContext } from './types';

const updateEventsStore = (events: IEvent[]): Effect.Effect<void, never, EventsStore> =>
  Effect.gen(function* () {
    const store = yield* EventsStore;
    yield* Ref.update(store, () => events);
  });

const updateContextStore = (context: IContext): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const store = yield* ContextStore;
    yield* Ref.update(store, () => context);
  });

export { updateEventsStore, updateContextStore };
