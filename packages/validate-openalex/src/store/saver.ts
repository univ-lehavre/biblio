import { end } from '../prompt';
import { Effect } from 'effect';
import { getEvents } from '../events';
import { getContext } from '../context';
import { copyFileSync, existsSync, writeFileSync } from 'fs';

const writeFile = (file: string, value: unknown, backup: boolean): void => {
  if (backup && existsSync(file)) copyFileSync(file, `backup-${file}`);
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
};

const saveContextStore = () =>
  Effect.gen(function* () {
    const context = yield* getContext();
    writeFile(context.context_file, context, context.backup);
  });

const saveEventsStore = () =>
  Effect.gen(function* () {
    const context = yield* getContext();
    const events = yield* getEvents();
    writeFile(context.events_file, events, context.backup);
  });

const saveStores = () =>
  Effect.gen(function* () {
    yield* saveContextStore();
    yield* saveEventsStore();
  });

const saveStoresAndExit = () =>
  Effect.gen(function* () {
    yield* saveStores();
    end();
    process.exit(0);
  });

const timestamp = (): string => new Date().toISOString().replaceAll(/[:.]/g, '-');

export { saveEventsStore, saveContextStore, saveStores, saveStoresAndExit, timestamp };
