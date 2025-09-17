import { Context, Ref } from 'effect';
import type { IState } from '../types';

class State extends Context.Tag('State')<State, Ref.Ref<IState>>() {}

export { State };
export * from './fixer';
export * from './getter';
export * from './setter';
