import { Effect, Ref } from 'effect';
import { ContextStore } from '../store';
import type { IContext } from '../store/types';

const getContext = (): Effect.Effect<IContext, never, ContextStore> =>
  Effect.gen(function* () {
    const store = yield* ContextStore;
    const context: IContext = yield* Ref.get(store);
    return context;
  });

const getORCID = () =>
  Effect.gen(function* () {
    const context = yield* getContext();
    if (context.type !== 'author')
      throw new Error(`Context is of type ${context.type}. ORCID needs a context of type author.`);
    return context.id as string;
  });

export { getContext, getORCID };
