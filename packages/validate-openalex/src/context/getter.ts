import { Effect, Ref } from 'effect';
import { ContextStore } from '../store';
import type { IContext } from '../store/types';

const getContext = (): Effect.Effect<IContext, never, ContextStore> =>
  Effect.gen(function* () {
    const store = yield* ContextStore;
    const context: IContext = yield* Ref.get(store);
    return context;
  });

const getORCID = (): Effect.Effect<string | undefined, never, ContextStore> =>
  Effect.gen(function* () {
    const { type, id }: IContext = yield* getContext();
    if (type !== 'author') return;
    return id;
  });

export { getContext, getORCID };
