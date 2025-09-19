import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { IEvent } from '../events/types';

const update_store_events = (events: IEvent[]): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* Ref.update(store, state => ({
      context: state.context,
      events,
    }));
  });

export { update_store_events };
