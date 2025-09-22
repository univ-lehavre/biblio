import { Effect, Ref } from 'effect';
import { EventsStore } from '../store';
import type { IEvent } from '../events/types';

const setEventsStore = (newEvents: IEvent[]): Effect.Effect<void, never, EventsStore> =>
  Effect.gen(function* () {
    const store = yield* EventsStore;
    yield* Ref.update(store, () => [...newEvents]);
  });

export { setEventsStore };
