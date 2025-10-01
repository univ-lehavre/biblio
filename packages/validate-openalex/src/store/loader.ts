import { Effect, Ref } from 'effect';
import { existsSync, readFileSync } from 'fs';
import { ContextStore, EventsStore } from '.';
import type { IEvent } from '../events/types';
import type { IContext } from '../context/types';
import { getContext } from '../context';

const readFile = <T>(file: string): T | null => {
  if (existsSync(file)) {
    const data = readFileSync(file, 'utf-8');
    return JSON.parse(data) as T;
  } else {
    return null;
  }
};

const loadContextStore = (): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const file: string = (yield* getContext()).context_file;
    const parsed: IContext = readFile(file) as IContext;
    if (parsed) {
      const store: Ref.Ref<IContext> = yield* ContextStore;
      yield* Ref.set(store, parsed);
    }
  });

const loadEventsStore = (): Effect.Effect<void, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const file = (yield* getContext()).events_file;
    const parsed = readFile(file) as IEvent[];
    if (parsed) {
      const store = yield* EventsStore;
      yield* Ref.set(store, parsed);
    }
  });

const loadStores = (): Effect.Effect<void, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    yield* loadContextStore();
    yield* loadEventsStore();
  });

export { loadStores };
