import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { IEvent } from '../events/types';
import { IContext } from './types';

const update_store_events = (events: IEvent[]): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* Ref.update(store, state => ({
      context: state.context,
      events,
    }));
  });

const update_store_context = (context: IContext): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    // Mettre à jour le label en fonction du display_name accepté
    // if (?context.label) context.label = undefined;
    yield* Ref.update(store, state => ({
      context,
      events: state.events,
    }));
  });

export { update_store_events, update_store_context };
