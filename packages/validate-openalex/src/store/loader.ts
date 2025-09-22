import { Effect, Ref } from 'effect';
import { existsSync, readFileSync } from 'fs';
import { ContextStore, EventsStore } from '.';
import type { IEvent } from '../events/types';
import type { IContext } from './types';

const readFile = (file: string) => {
  if (existsSync(file)) {
    const data = readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } else {
    return null;
  }
};

const loadContextStore = (file: string = 'context.json') =>
  Effect.gen(function* () {
    const parsed: IContext = readFile(file) as IContext;
    if (parsed) {
      const store = yield* ContextStore;
      yield* Ref.set(store, parsed);
    }
  });

const loadEventsStore = (file: string = 'events.json') =>
  Effect.gen(function* () {
    const parsed = readFile(file) as IEvent[];
    if (parsed) {
      const store = yield* EventsStore;
      yield* Ref.set(store, parsed);
    }
  });

const loadStores = () =>
  Effect.gen(function* () {
    yield* loadContextStore();
    yield* loadEventsStore();
  });

export { loadStores };
