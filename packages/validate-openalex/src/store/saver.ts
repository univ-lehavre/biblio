import { Store } from '.';
import { Effect, Ref } from 'effect';
import { copyFileSync, existsSync, writeFileSync } from 'fs';
import { color, outro } from '../prompt';

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

const save_and_exit = (
  file: string = 'state.json',
  backup: boolean = true,
): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    yield* save(file, backup);
    outro(`${color.bgGreen(color.black(` Fin `))}`);
    process.exit(0);
  });

const timestamp = (): string => new Date().toISOString().replaceAll(/[:.]/g, '-');

export { save, save_and_exit, timestamp };
