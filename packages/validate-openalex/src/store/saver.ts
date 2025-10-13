import { end } from '../prompt';
import { Effect } from 'effect';
import { getEvents } from '../events';
import { getContext } from '../context';
import { copyFileSync, existsSync, writeFileSync } from 'fs';
import { ContextStore, EventsStore } from '.';

const timestamp = (): string => new Date().toISOString().replace(/[:.]/g, '-');

const writeFile = (value: unknown, file: string, backup: boolean): void => {
  if (backup && existsSync(file)) copyFileSync(file, `${timestamp()}-${file}`);
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
};

const saveContextStore = (): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const context = yield* getContext();
    writeFile(context, context.context_file, context.backup);
  });

const saveEventsStore = (): Effect.Effect<void, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const context = yield* getContext();
    const events = yield* getEvents();
    writeFile(events, context.events_file, context.backup);
  });

const saveStores = (): Effect.Effect<void, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    yield* saveContextStore();
    yield* saveEventsStore();
  });

const saveStoresAndExit = (): Effect.Effect<never, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    yield* saveStores();
    end();
    process.exit(0);
  });

export { saveEventsStore, saveContextStore, saveStores, saveStoresAndExit };
