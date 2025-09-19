import { Store } from '.';
import { Effect, Ref } from 'effect';
import { existsSync, readFileSync } from 'fs';
import type { IState } from './types';

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

export { loadState };
