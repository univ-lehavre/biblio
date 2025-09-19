import type { IEntity, IEvent } from '../events/types';

interface IContext {
  type: IEntity | 'none';
  id: string | undefined;
  label?: string;
}

interface IState {
  context: IContext;
  events: IEvent[];
}

export type { IContext, IState };
