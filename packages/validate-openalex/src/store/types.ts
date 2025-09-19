import type { IEntity, IEvent } from '../events/types';

type IContextType = IEntity | 'none';

interface IContext {
  type: IContextType;
  id: string | undefined;
  label?: string;
}

interface IState {
  context: IContext;
  events: IEvent[];
}

export type { IContext, IContextType, IState };
