import { Store } from '.';
import { Effect, Ref } from 'effect';
import { copyFileSync, existsSync, writeFileSync } from 'fs';

const save = (
  file: string = 'state.json',
  backup: boolean = true,
): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    if (backup && existsSync(file)) copyFileSync(file, `backup-${file}`);
    const state = yield* Store;
    const value = yield* Ref.get(state);
    writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
  });

const timestamp = (): string => new Date().toISOString().replaceAll(/[:.]/g, '-');

export { save, timestamp };
