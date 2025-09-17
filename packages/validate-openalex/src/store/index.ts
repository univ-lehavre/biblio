import { Context, Ref } from 'effect';
import type { IState } from '../types';

class Store extends Context.Tag('Store')<Store, Ref.Ref<IState>>() {}

export { Store };
export * from './fixer';
export * from './getter';
export * from './setter';
