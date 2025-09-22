import type { IEntity } from '../events/types';

type IContextType = IEntity | 'none';

interface IContext {
  type: IContextType;
  // Description
  id: string | undefined;
  label?: string;
  // Stockage du contexte et des évènements
  backup: boolean;
  context_file: string;
  events_file: string;
  NAMESPACE: string;
}

export type { IContext, IContextType };
