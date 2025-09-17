import { Store } from '.';
import { Effect, Ref } from 'effect';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import type { IState } from '../types';

const loadState = (file: string): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    let parsed: IState = { context: { type: 'none', id: undefined }, events: [] };
    if (existsSync(file)) {
      const data = readFileSync(file, 'utf-8');
      parsed = JSON.parse(data);
    }
    const state = yield* Store;
    yield* Ref.set(state, parsed);
  });

const saveState = () =>
  Effect.gen(function* () {
    const state = yield* Store;
    if (existsSync('state.json')) copyFileSync('state.json', `state-backup.json`);
    const value = yield* Ref.get(state);
    writeFileSync('state.json', JSON.stringify(value, null, 2), 'utf-8');
  });

const timestamp = () => new Date().toISOString().replaceAll(/[:.]/g, '-');

export { loadState, saveState, timestamp };
