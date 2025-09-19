import type { IEntity, IField } from '../events/types';
import type { IState } from '../store/types';

interface PendingOptions {
  orcid?: string;
  entity?: IEntity;
  field?: IField;
}

interface Action {
  name: string;
  isActive: (state: IState) => boolean;
}

export type { Action, PendingOptions };
