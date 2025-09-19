import { Context, Ref } from 'effect';
import type { IState } from './types';

class Store extends Context.Tag('Store')<Store, Ref.Ref<IState>>() {}

export * from './loader';
export * from './saver';
export { Store };
