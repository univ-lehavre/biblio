import { Context, Effect, Ref } from 'effect';
import type { IState } from './types';

class Store extends Context.Tag('Store')<Store, Ref.Ref<IState>>() {}

const provideStore = () => Effect.provideServiceEffect(Store, Ref.make({} as IState));

export { Store, provideStore };
export * from './loader';
export * from './saver';
export * from './updater';
